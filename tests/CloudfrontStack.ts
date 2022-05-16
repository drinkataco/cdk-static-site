import { Template, Match } from 'aws-cdk-lib/assertions';
import { App, Stack } from 'aws-cdk-lib';
import {
  AllowedMethods,
  OriginAccessIdentity,
  PriceClass,
} from 'aws-cdk-lib/aws-cloudfront';
import { Bucket } from 'aws-cdk-lib/aws-s3';

import CloudfrontStack from '../lib/stacks/Cloudfront';

/*
 * Here we're mocking the HostedZone.fromLookup function.
 * This is so we can mock a lookup and generate a template without actually requiring a resource to
 *  exit
 */
jest.mock('aws-cdk-lib/aws-route53', () => ({
  ...jest.requireActual('aws-cdk-lib/aws-route53'),
  HostedZone: {
    fromLookup: jest.fn().mockImplementationOnce((stack, id, props) => ({
      hostedZoneArn: 'test',
      hostedZoneId: id,
      stack,
      zoneName: props.domainName,
    })),
  },
}));

describe('stack for Cloudfront', () => {
  it('synthesizes correctly for only required config', () => {
    const app = new App();
    const stack = new Stack(app, 'TestDependenciesStack');

    const bucket = new Bucket(stack, 'Bucket');
    const originAccessIdentity = new OriginAccessIdentity(stack, 'OAI');

    const cloudfrontStack = new CloudfrontStack(app, 'TestCloudfrontStack', {
      bucket,
      originAccessIdentity,
    });

    const template = Template.fromStack(cloudfrontStack);

    template.hasResourceProperties(
      'AWS::CloudFront::Distribution',
      Match.objectEquals({
        DistributionConfig: {
          Comment: "Cloudfront destribution for S3 Bucket 'Bucket'",
          DefaultCacheBehavior: {
            AllowedMethods: [
              'GET',
              'HEAD',
              'OPTIONS',
              'PUT',
              'PATCH',
              'POST',
              'DELETE',
            ],
            CachePolicyId: Match.anyValue(),
            Compress: true,
            FunctionAssociations: [],
            TargetOriginId: Match.anyValue(),
            ViewerProtocolPolicy: 'redirect-to-https',
          },
          DefaultRootObject: 'index.html',
          Enabled: true,
          HttpVersion: 'http2',
          IPV6Enabled: true,
          Origins: [
            {
              DomainName: {
                'Fn::ImportValue': Match.anyValue(),
              },
              Id: Match.anyValue(),
              S3OriginConfig: {
                OriginAccessIdentity: {
                  'Fn::Join': [
                    '',
                    [
                      'origin-access-identity/cloudfront/',
                      {
                        'Fn::ImportValue': Match.anyValue(),
                      },
                    ],
                  ],
                },
              },
            },
          ],
          PriceClass: 'PriceClass_All',
        },
      }),
    );
  });

  it('synthesizes correctly for all config', () => {
    const app = new App();
    const stack = new Stack(app, 'TestDependenciesStack');

    const bucket = new Bucket(stack, 'Bucket');
    const originAccessIdentity = new OriginAccessIdentity(stack, 'OAI');

    const cloudfrontStack = new CloudfrontStack(app, 'TestCloudfrontStack', {
      allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
      bucket,
      defaultRootObject: 'entry.html',
      denyGeo: ['US', 'CN'],
      dns: {
        hostedZoneDomainName: 'example.org',
        subdomain: 'my-site',
      },
      errorResponses: {
        404: '/error/404.html',
      },
      enableLogging: true,
      originAccessIdentity,
      priceClass: PriceClass.PRICE_CLASS_100,
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
    });

    const template = Template.fromStack(cloudfrontStack);

    template.hasResourceProperties(
      'AWS::CloudFront::Distribution',
      Match.objectEquals({
        DistributionConfig: {
          Aliases: ['my-site.example.org'],
          Comment: "Cloudfront destribution for S3 Bucket 'Bucket'",
          CustomErrorResponses: [
            {
              ErrorCode: 404,
              ResponseCode: 404,
              ResponsePagePath: '/error/404.html',
            },
          ],
          DefaultCacheBehavior: {
            AllowedMethods: ['GET', 'HEAD'],
            CachePolicyId: Match.anyValue(),
            Compress: true,
            FunctionAssociations: [],
            TargetOriginId: Match.anyValue(),
            ViewerProtocolPolicy: 'redirect-to-https',
          },
          DefaultRootObject: 'entry.html',
          Enabled: true,
          HttpVersion: 'http2',
          IPV6Enabled: true,
          Logging: {
            Bucket: Match.anyValue(),
          },
          Origins: [
            {
              DomainName: {
                'Fn::ImportValue': Match.anyValue(),
              },
              Id: Match.anyValue(),
              S3OriginConfig: {
                OriginAccessIdentity: {
                  'Fn::Join': [
                    '',
                    [
                      'origin-access-identity/cloudfront/',
                      {
                        'Fn::ImportValue': Match.anyValue(),
                      },
                    ],
                  ],
                },
              },
            },
          ],
          PriceClass: 'PriceClass_100',
          Restrictions: {
            GeoRestriction: {
              Locations: ['US', 'CN'],
              RestrictionType: 'blacklist',
            },
          },
          ViewerCertificate: {
            AcmCertificateArn: Match.anyValue(),
            MinimumProtocolVersion: 'TLSv1.2_2021',
            SslSupportMethod: 'sni-only',
          },
        },
      }),
    );
  });
});
