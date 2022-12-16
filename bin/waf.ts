#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WafStack } from '../lib/waf-stack';

const app = new cdk.App();
new WafStack(app, 'WafStack', {
 env: {
    region: "us-east-1",
  },
});