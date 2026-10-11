import {
  categoryPathOf,
  resolveCommissionRate,
  type CommissionResolution,
  type CommissionRuleLite,
  type CommissionScopeValue,
} from '@ecommerce/types';
import type { PrismaService } from '../../prisma/prisma.service';

export type CommissionResolver = (args: {
  vendorId: string;
  categoryId: string | null;
  vendorRate: number | null;
}) => CommissionResolution;

/** Loads active rules and the category tree once, then resolves rates in memory. */
export async function loadCommissionResolver(
  prisma: PrismaService,
  defaultRate: number,
): Promise<CommissionResolver> {
  const [rows, categories] = await Promise.all([
    prisma.commissionRule.findMany({ where: { isActive: true }, orderBy: { updatedAt: 'desc' } }),
    prisma.category.findMany({ select: { id: true, parentId: true } }),
  ]);
  const rules: CommissionRuleLite[] = rows.map((r) => ({
    id: r.id,
    scope: r.scope as CommissionScopeValue,
    vendorId: r.vendorId,
    categoryId: r.categoryId,
    rate: Number(r.rate),
    isActive: r.isActive,
  }));
  const parents = new Map(categories.map((c) => [c.id, c.parentId]));
  return ({ vendorId, categoryId, vendorRate }) =>
    resolveCommissionRate(rules, {
      vendorId,
      categoryPath: categoryPathOf(categoryId, parents),
      vendorRate,
      defaultRate,
    });
}
