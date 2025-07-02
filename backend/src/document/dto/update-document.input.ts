import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateDocumentInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  fileUrl?: string;
}
