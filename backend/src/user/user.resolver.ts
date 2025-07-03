import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from './user.model';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User], { name: 'users' })
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Query(() => User, { name: 'user', nullable: true })
  async findOne(@Args('id') id: string): Promise<User | null> {
    return this.userService.findById(id);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<User> {
    return this.userService.create(createUserInput);
  }

  @Mutation(() => User, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @Args('id') id: string,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser()
    currentUser: { userId: string; email: string; role: UserRole },
  ): Promise<User | null> {
    // Un utilisateur ne peut modifier que son propre profil, sauf s'il est admin
    if (currentUser.role !== UserRole.ADMIN && currentUser.userId !== id) {
      throw new Error('Vous ne pouvez modifier que votre propre profil');
    }
    return this.userService.update(id, updateUserInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteUser(@Args('id') id: string): Promise<boolean> {
    return this.userService.delete(id);
  }
}
