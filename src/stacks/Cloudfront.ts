import { Construct } from 'constructs';
import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import {
  AllowedMethods,
  Distribution,
  ErrorResponse,
  GeoRestriction,
  OriginAccessIdentity,
  PriceClass,
  SecurityPolicyProtocol,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import {
  Certificate,
  DnsValidatedCertificate,
  ICertificate,
} from 'aws-cdk-lib/aws-certificatemanager';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import {
  ARecord,
  AaaaRecord,
  HostedZone,
  IHostedZone,
  RecordTarget,
} from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Bucket } from 'aws-cdk-lib/aws-s3';

import * as T from '../types';

/**
 * Configurable options for stack as properties
 */
interface CloudfrontStackProps extends StackProps {
  /** Allowed HTTP methods to cloudfront */
  allowedMethods?: AllowedMethods;
  /** The bucket we have previously created */
  bucket: Bucket;
  /** Default root object */
  defaultRootObject?: string;
  /** Countries to deny access */
  denyGeo?: Array<string>;
  /**
   * DNS information if setting up a custom domain
   * This could include hosted zone, certificate, and dns record information
   */
  dns?: T.CloudfrontDns;
  /** Objects to serve for specific error codes */
  errorResponses?: T.HttpErrorObject;
  /** whether to log requests to cloudfront */
  enableLogging?: boolean;
  /** The buckets OAI we have previously created */
  originAccessIdentity: OriginAccessIdentity;
  /** The price class of the distribution */
  priceClass?: PriceClass;
  /** The security protocol for HTTPS */
  securityProtocolMinimum?: SecurityPolicyProtocol;
}

/**
 * Default Properties
 */
const defaultProps: Partial<CloudfrontStackProps> = {
  allowedMethods: AllowedMethods.ALLOW_ALL,
  defaultRootObject: 'index.html',
  enableLogging: false,
  priceClass: PriceClass.PRICE_CLASS_ALL,
  securityProtocolMinimum: SecurityPolicyProtocol.TLS_V1_2_2018,
};

/**
 * This stack creates a Cloudfront distribution to sit in front of an S3 Origin
 */
class CloudfrontStack extends Stack {
  /**
   * Certificate object for HTTPS if hosted zone domain provided
   */
  private certificate!: ICertificate;

  /**
   * The distribution created
   */
  private distribution: Distribution;

  /**
   * The custom domain name of the service - including subdomain, if set
   */
  private domainName!: string;

  /**
   * The hosted zone fetched from the hosted zone domain name
   * Used for certificate DNS validation (if no ARN provided) and cloudfront mapping
   */
  private hostedZone!: IHostedZone;

  /**
   * Our stack properties
   */
  private props: CloudfrontStackProps;

  constructor(
    scope: Construct,
    private id: string,
    props: CloudfrontStackProps,
  ) {
    super(scope, id, props);

    this.props = {
      ...defaultProps,
      ...props,
    };

    // Iinitialise DNS (if applicable)
    if (this.props.dns) {
      this.initialiseDns();

      new CfnOutput(this, `${this.id}-output-domain-name`, {
        value: this.getDomainName(),
      });
    }

    // Create Cloudfront Distribution
    this.distribution = this.createDistribution();

    new CfnOutput(this, `${this.id}-output-distribution-id`, {
      value: this.getDistribution().distributionId,
    });
    new CfnOutput(this, `${this.id}-output-distribution-domain-name`, {
      value: this.getDistribution().distributionDomainName,
    });

    // Create DNS records to map cloudfront distribution URL to DNS Record
    if (this.props.dns) {
      this.createDnsRecords();

      new CfnOutput(this, `${this.id}-output-certificate`, {
        value: this.getCertificate().certificateArn,
      });
    }
  }

  /**
   * Create a certificate and validate with DNS within the correct hosted zone
   */
  private createCertificate(): ICertificate {
    return new DnsValidatedCertificate(this, `${this.id}-certificate`, {
      domainName: this.getDomainName(),
      hostedZone: this.getHostedZone(),
      region: 'us-east-1',
    });
  }

  /**
   * Create the cloudfront distribution for the S3 origin
   */
  private createDistribution(): Distribution {
    // Convert key:value pair of http code to object path to ErrorResponse object
    const errorResponses: Array<ErrorResponse> = Object.keys(
      this.props.errorResponses || {},
    ).map((httpStatus: string) => ({
      httpStatus: Number(httpStatus),
      responsePagePath: this.props.errorResponses?.[
        Number(httpStatus)
      ] as string,
    }));

    return new Distribution(this, `${this.id}-distribution`, {
      /** Comment to distinguish which bucket is forwarded by Cloudfront */
      comment: `Cloudfront destribution for S3 Bucket '${
        this.props.bucket.toString().split('/')[1]
      }'`,
      /** If we have a custom domain name we must have a certificate defined for HTTPS */
      certificate: this.getCertificate(),
      /** The root object of the cloudfront distribution; for example index.html */
      defaultRootObject: this.props.defaultRootObject,
      /**
       * The default behaviour is our S3 bucket.
       * This definition allows us to treat S3 as a http origin, we don't want to use the S3
       *   isWebsite settings, we'll let cloudfront deal with that
       */
      defaultBehavior: {
        /** HTTP Methods to allow */
        allowedMethods: this.props.allowedMethods,
        /** We will enable compression by default */
        compress: true,
        /** The origin is default as an S3 Bucket */
        origin: new S3Origin(this.props.bucket, {
          /** We will apply the OAI so Cloudfront can read it */
          originAccessIdentity: this.props.originAccessIdentity,
        }),
        /** Always redirect to https */
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      /** Any domain name aliases we want to use */
      domainNames: this.domainName ? [this.domainName] : undefined,
      /** Log requests? */
      enableLogging: this.props.enableLogging,
      /** Objects to respond with on error codes */
      errorResponses,
      /** Geo Restrictions */
      geoRestriction: this.props.denyGeo?.length
        ? GeoRestriction.denylist(...this.props.denyGeo)
        : undefined,
      /**
       * The Price Class for the distribution. By default deployed to ALL edge locations, but
       *  we might want to cheap on this
       */
      priceClass: this.props.priceClass,
    });
  }

  /**
   * Create DNS records for domain alias if set
   */
  private createDnsRecords(): void {
    const target = RecordTarget.fromAlias(
      new CloudFrontTarget(this.getDistribution()),
    );

    new ARecord(this, `${this.id}-a-record`, {
      recordName: this.getDomainName(),
      target,
      zone: this.getHostedZone(),
    });

    new AaaaRecord(this, `${this.id}-aaaa-record`, {
      recordName: this.getDomainName(),
      target,
      zone: this.getHostedZone(),
    });
  }

  /**
   * Get the certificate object
   */
  private getCertificate(): ICertificate {
    return this.certificate;
  }

  /**
   * Get cloudfront distribution object
   */
  private getDistribution(): Distribution {
    return this.distribution;
  }

  /**
   * Get the domain alias
   */
  private getDomainName(): string {
    return this.domainName;
  }

  /**
   * Get the fetched hosted zone object
   */
  private getHostedZone(): IHostedZone {
    return this.hostedZone;
  }

  /**
   * Initialise DNS by fetching hosted zone object and fetching (or creating) https certificate
   */
  private initialiseDns(): void {
    const dns = this.props.dns as T.CloudfrontDns;

    // Get HostedZone
    this.hostedZone = HostedZone.fromLookup(this, `${this.id}-hosted-zone`, {
      domainName: dns.hostedZoneDomainName as string,
    });

    // Set full domain name
    this.domainName = dns.hostedZoneDomainName;
    if (dns.subdomain) {
      this.domainName = `${dns.subdomain}.${dns.hostedZoneDomainName}`;
    }

    // If an ARN is set, simple. Let's just fetch that certificate.
    // ELSE let's create the certificate and validate with DNS
    this.certificate = dns.certificateArn
      ? Certificate.fromCertificateArn(
        this,
        `${this.id}-certificate`,
        dns.certificateArn,
      )
      : this.createCertificate();
  }
}

export default CloudfrontStack;
