/**
 * Resource tags, as key value pairs
 */
export interface ITags {
  [s: string]: string;
}

/**
 * Cloudfront Price Class ENV Values
 * @see https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cloudfront.PriceClass.html
 */
export type PriceClass = 'PRICE_CLASS_100' | 'PRICE_CLASS_200' | 'PRICE_CLASS_ALL';

/**
 * Cloudfront SecurityPolicyProtocol enum values, as type
 * TLS 1.2+
 * @see https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cloudfront.SecurityPolicyProtocol.html
 */
export type SecurityPolicyProtocol = 'TLS_V1_2_2018' | 'TLS_V1_2_2019' | 'TLS_V1_2_2021' | undefined;

/**
 * Cloudfront Behaviour Allowed Methods
 * @see https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cloudfront.AllowedMethods.html
 */
export type AllowedMethods = 'ALLOW_ALL' | 'ALLOW_GET_HEAD' | 'ALLOW_GET_HEAD_OPTIONS';

/**
 * HTTP Response to S3 object path to respond with
 */
export interface HttpErrorObject {
  [n: number]: string;
}

/**
 * DNS Options for Cloudfront
 */
export interface CloudfrontDns {
  /** Already created certificate to use */
  certificateArn?: string,
  /** The domain name of the Hosted Zone we're using */
  hostedZoneDomainName: string,
  /** Record name/subdomain of site if not root */
  subdomain?: string,
}
