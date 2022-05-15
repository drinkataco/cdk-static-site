/**
 * Resource tags, as key value pairs
 */
export interface Tags {
  [s: string]: string;
}

/**
 * Caching Strategies for S3 objects, as key value pairs
 */
export interface GlobCacheControl {
  /** A key, as a glob, with a cache-control header as the value */
  [glob: string]: string;
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
