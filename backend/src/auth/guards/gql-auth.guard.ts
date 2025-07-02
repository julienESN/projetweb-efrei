import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as Express from 'express';

interface GraphQLContext {
  req: Express.Request & { user?: any };
}

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext): Express.Request {
    const ctx = GqlExecutionContext.create(context);
    const graphqlContext = ctx.getContext<GraphQLContext>();
    return graphqlContext.req;
  }
}
