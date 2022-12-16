#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CloudfrontStack } from '../lib/cloudfront-stack';

const app = new cdk.App();

new CloudfrontStack(app, 'CloudfrontStack', {
  env: {
    region: 'ap-northeast-1',
  },
});