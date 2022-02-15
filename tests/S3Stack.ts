import { Template, Match } from 'aws-cdk-lib/assertions';
import { App, Stack } from 'aws-cdk-lib';

import S3Stack from '../lib/stacks/S3';

describe('stack for S3', () => {
  it('syntehsizes correctly for only required config', () => {
    const app = new App();
    const stack = new Stack(app, 'S3Stack');

    const s3Stack = new S3Stack(stack, 'TestS3Stack', {
      bucketSource: {
        path: '/path/to/files',
      },
    });

    const template = Template.fromStack(s3Stack);

    template.hasResource(
      'AWS::S3::Bucket',
      Match.objectEquals({
        Type: 'AWS::S3::Bucket',
        UpdateReplacePolicy: 'Retain',
        DeletionPolicy: 'Retain',
      }),
    );

    template.hasResourceProperties(
      'AWS::CloudFront::CloudFrontOriginAccessIdentity',
      Match.objectEquals({
        CloudFrontOriginAccessIdentityConfig: {
          Comment: {
            'Fn::Join': [
              '',
              [
                "OriginAccessIdentity for S3 Bucket '",
                { Ref: Match.anyValue() },
                "'",
              ],
            ],
          },
        },
      }),
    );

    template.hasResourceProperties(
      'AWS::S3::BucketPolicy',
      Match.objectLike({
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith(
            [Match.objectLike({
              Action: ['s3:GetObject*', 's3:GetBucket*', 's3:List*'],
            })],
          ),
        }),
      }),
    );
  });

  it('synthesizes correctly for all config', () => {
    const app = new App();
    const stack = new Stack(app, 'S3Stack');

    const s3Stack = new S3Stack(stack, 'TestS3Stack', {
      bucketName: 'this-is-my-bucket',
      bucketSource: {
        path: '/path/to/files',
      },
      forceRemove: true,
    });

    const template = Template.fromStack(s3Stack);

    template.hasResource(
      'AWS::S3::Bucket',
      Match.objectEquals({
        Type: 'AWS::S3::Bucket',
        UpdateReplacePolicy: 'Delete',
        DeletionPolicy: 'Delete',
        Properties: {
          BucketName: 'this-is-my-bucket',
          Tags: [
            {
              Key: 'aws-cdk:auto-delete-objects',
              Value: 'true',
            },
          ],
        },
      }),
    );
  });
});
