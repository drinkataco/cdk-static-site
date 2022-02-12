# Static Site Cloud Development Kit

This repositories purpose is to provision a Cloudfront distribution for an S3 bucket fronted by a Route53 DNS Record.

![Diagram](./assets/diagram.png)

Its aim is to be highly configurable from ENV variables to allow reuse for any static website. Allowing you to configure S3 options, cloudfront options (such as error responses, geo blocks, http methods) and custom domains (https certificates, hosted zone name, subdomain name).

See: [AWS Cloud Development Kit (CDK)](https://github.com/aws/aws-cdk)

## Getting started

### Environment Variables

To get started you must set up a `.env` file. You can copy the [template](.env.example) and set out the minimum request to get started:

* `APP_NAME` - This is the name of your app and cloudformation template prefixes
* `S3_BUCKET_NAME` - a unique name for a S3 bucket to be provisioned
* `S3_CONTENT_PATH` - local path to content to place on S3 and serve via Cloudfront
* `ROUTE53_HOSTED_ZONE_DOMAIN` - _optional_ the domain of hosted zone which you you want to attach an alias to.
* `ROUTE53_SUBDOMAIN` _(optional)_ - the subdomain (record name) if you don't want to use the root of the hosted zone domain

That's as little as **three** required variables (or **four** for route53 support) to get started.

Make sure you have your AWS credentials set locally, such as an [AWS_PROFILE](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) environment variable so that you can publish to your AWS account.

Then run `npm run cdk:deploy`! Alternatively to destroy, run `npm run cdk:destroy`.

However, you can configure a lot more options:

#### Extended Configuration

##### Metadata

* `TAGS` - define tags for every resources, with keys and values separated by `=` and tags separated by `,`, for example, `Author=Bob Dylan,Project=test`.

##### S3

* `S3_FORCE_REMOVE` _(default: 0)_ - a numerical value (0 for false, 1 for true) to indicate whether the S3 bucket should be force emptied and deleted when stacks are destroyed. You will loose your data in this bucket if set to `1`.

##### Cloudfront

* `CLOUDFRONT_ALLOWED_METHODS` _(default: ALLOW_ALL)_ - allowed HTTP methods. Enum value defined [here](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cloudfront.AllowedMethods.html
)
* `CLOUDFRONT_ERROR_RESPONSES` - HTTP error codes and the objects they map to for default responses, for example `404=/404.html,500=error.html`
* `CLOUDFRONT_GEO_ALLOWLIST` TODO
* `CLOUDFRONT_GEO_DENYLIST` TODO
* `CLOUDFRONT_LOGGING` _(default: 0)_ - a numerical value (0 for false, 1 for true) to indicate whether logging should be enabled for cloudfront
* `CLOUDFRONT_PRICE_CLASS` _(default: ALL)_ - Price Class of Cloudfront Distribution. Enum value defined [here](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cloudfront.PriceClass.html)
* `CLOUDFRONT_ROOT_OBJECT` _(default: index.html)_ - default root object of distribution

##### Route53 and Certificate Manager

* `CERTICIATE_ARN` - an ARN of an already provisioned certificate to use for the domain alias if you don't want one to be auto provisioned

## TODO

This repository is a working progress. Left to do before release is:

- [x] Test env vars
- [x] README
- [ ] Cleanup (itags, types needed for enums? remove zod comments. address all todo)
- [ ] Add geo restrictions and http method
- [ ] Allow no subdomain (just attach to root hosted zone if none supplied)
- [ ] Add Tests
- [ ] Add CICD (for tests/linting)
- [ ] issue etc templates
- [ ] Publish
- [ ] CORS testing
- [ ] Allow cloudfunctions or lambda@edge for 'index.html' problem



