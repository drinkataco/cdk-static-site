/* eslint-disable no-unused-vars */
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_NAME: string;
      TAGS?: string;
      S3_BUCKET_NAME: string;
      S3_CONTENT_PATH?: string;
      S3_FORCE_REMOVE?: number;
      CLOUDFRONT_ERROR_RESPONSES: string;
      CLOUDFRONT_PRICE_CLASS?: string;
      CLOUDFRONT_ROOT_OBJECT?: string;
      CLOUDFRONT_LOGGING?: number;
      CLOUDFRONT_GEO_ALLOWLIST?: string;
      CLOUDFRONT_GEO_DENYLIST?: string;
      CLOUDFRONT_ALLOWED_METHODS?: string;
      CERTIFICATE_ARN?: string,
      ROUTE53_HOSTED_ZONE_DOMAIN?: string;
      ROUTE53_SUBDOMAIN?: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
