import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateDocumentInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  fileUrl?: string;

  @Field({ nullable: true })
  userId?: string;
}
