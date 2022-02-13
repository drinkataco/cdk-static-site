/**
 * Resource tags, as key value pairs
 */
export interface Tags {
  [s: string]: string;
}

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
