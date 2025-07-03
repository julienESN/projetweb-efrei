import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Document {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => String, { nullable: true })
  fileUrl?: string | null;

  @Field()
  userId: string; // ID de l'utilisateur propriétaire

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
