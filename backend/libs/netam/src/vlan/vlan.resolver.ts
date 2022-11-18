import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Vlan } from './vlan.model';
import { PrismaService } from '../../../../src/database/prisma.service';

@Resolver(() => Vlan)
export class VlanResolver {
  constructor(private readonly prismaService: PrismaService) {}

  @Query(() => [Vlan])
  async getVlans(): Promise<Vlan[]> {
    return this.prismaService.vlans.findMany({
      orderBy: [{ id: 'asc' }],
    });
  }

  @Query(() => Vlan)
  async getVlanId(
    @Args('vlanId', { type: () => Int }) vlanId: number,
  ): Promise<Vlan> {
    return this.prismaService.vlans.findFirst({
      orderBy: [{ id: 'asc' }],
      where: { vlanId: vlanId },
    });
  }

  @Query(() => [Vlan])
  async getVlanName(@Args('name') name: string): Promise<Vlan[]> {
    return this.prismaService.vlans.findMany({
      orderBy: [{ name: 'asc' }],
      where: {
        name: {
          contains: name,
        },
      },
    });
  }

  @Query(() => Vlan)
  async createVlan(
    @Args('name') name: string,
    @Args('vlanId', { type: () => Int }) vlanId: number,
    @Args('description', { defaultValue: null }) description: string,
  ): Promise<Vlan> {
    await this.prismaService.vlans.create({
      data: {
        name: name,
        description: description,
        vlanId: vlanId,
      },
    });
    return this.prismaService.vlans.findFirst({
      orderBy: [{ id: 'asc' }],
      where: { vlanId: vlanId },
    });
  }

  @Query(() => Vlan)
  async deleteVlan(@Args('id', { type: () => Int }) id: number): Promise<Vlan> {
    const vlan: Vlan = await this.prismaService.vlans.findFirst({
      where: { id: id },
    });
    await this.prismaService.vlans.delete({
      where: {
        id: id,
      },
    });
    return vlan;
  }

  @Query(() => Vlan)
  async updateVlan(
    @Args('id', { type: () => Int }) id: number,
    @Args('name', { defaultValue: null }) name: string,
    @Args('description', { defaultValue: null }) description: string,
    @Args('vlanId', { type: () => Int, defaultValue: null }) vlanId: number,
  ): Promise<Vlan> {
    type vlanStruct = {
      name?: string;
      description?: string;
      vlanId?: number;
    };

    const vlanData: vlanStruct = {};

    name !== null ? (vlanData.name = name) : (vlanData.name = undefined);
    description !== null
      ? (vlanData.description = description)
      : (vlanData.description = undefined);
    vlanId !== null
      ? (vlanData.vlanId = vlanId)
      : (vlanData.vlanId = undefined);

    await this.prismaService.vlans.update({
      where: { id: id },
      data: vlanData,
    });
    return this.prismaService.vlans.findFirst({
      where: { id: id },
    });
  }

  @ResolveField()
  async sections(@Parent() vlan: Vlan) {
    const { id } = vlan;
    return this.prismaService.sections.findMany({ where: { vlanId: id } });
  }
}
