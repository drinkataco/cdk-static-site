import { App, StackProps, Tags } from 'aws-cdk-lib';

import * as G from './consts';
import { Tags as TagMap, CloudfrontDns } from './types';
import CloudfrontStack from './stacks/Cloudfront';
import S3Stack from './stacks/S3';

const app = new App();

// Default props for our stacks
const defaultProps: StackProps = {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
};

// Attach default tags to all app resources
const defaultTags: TagMap = {
  AppName: G.APP_NAME,
  DateModified: new Date().toISOString(),
  ...G.TAGS,
};

Object.keys(defaultTags).forEach((tag: string) => {
  Tags.of(app).add(tag, defaultTags[tag]);
});

//
// Create Stacks
//
const S3 = new S3Stack(app, `${G.APP_NAME}-s3`, {
  ...defaultProps,
  bucketName: G.S3_BUCKET_NAME,
  bucketSource: { path: G.S3_CONTENT_PATH },
  forceRemove: G.S3_FORCE_REMOVE,
});

S3.deploy();

// Custom DNS is optional. We'll only create the object if a hosted zone domain has been provided
let dns!: CloudfrontDns;
if (G.ROUTE53_HOSTED_ZONE_DOMAIN) {
  dns = {
    certificateArn: G.CERTIFICATE_ARN,
    hostedZoneDomainName: G.ROUTE53_HOSTED_ZONE_DOMAIN,
    subdomain: G.ROUTE53_SUBDOMAIN,
  };
}

new CloudfrontStack(app, `${G.APP_NAME}-cloudfront`, {
  ...defaultProps,
  allowedMethods: G.CLOUDFRONT_ALLOWED_METHODS,
  bucket: S3.getBucket(),
  defaultRootObject: G.CLOUDFRONT_ROOT_OBJECT,
  denyGeo: G.CLOUDFRONT_GEO_DENYLIST,
  dns,
  enableLogging: G.CLOUDFRONT_LOGGING,
  errorResponses: G.CLOUDFRONT_ERROR_RESPONSES,
  originAccessIdentity: S3.getOriginAccessIdentity(),
  priceClass: G.CLOUDFRONT_PRICE_CLASS,
});
