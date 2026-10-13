import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers.dart';
import '../theme.dart';
import '../widgets.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cats = ref.watch(categoriesProvider);
    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(categoriesProvider);
          ref.invalidate(productsProvider);
        },
        child: CustomScrollView(slivers: [
          // Violet header with logo + search
          SliverAppBar(
            pinned: true,
            expandedHeight: 120,
            title: const Text.rich(TextSpan(text: 'Ecommerce', children: [TextSpan(text: '.', style: TextStyle(color: Brand.yellow))])),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(64),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: GestureDetector(
                  onTap: () => context.push('/products?title=Search'),
                  child: Container(
                    height: 48,
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(Brand.r16)),
                    child: const Row(children: [
                      Icon(Icons.search, color: Brand.muted),
                      SizedBox(width: 10),
                      Text('What are you looking for today?', style: TextStyle(color: Brand.muted)),
                    ]),
                  ),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(child: _Hero()),
          // Categories (top level only)
          SliverToBoxAdapter(
            child: SectionHead('Shop by category', eyebrow: 'Explore', onAll: () => context.go('/categories')),
          ),
          SliverToBoxAdapter(
            child: cats.when(
              loading: loading,
              error: (e, _) => failed(e, () => ref.invalidate(categoriesProvider)),
              data: (list) => SizedBox(
                height: 118,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  scrollDirection: Axis.horizontal,
                  itemCount: list.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 12),
                  itemBuilder: (_, i) {
                    final c = list[i];
                    return GestureDetector(
                      onTap: () => context.push('/products?category=${c.slug}&title=${Uri.encodeComponent(c.name)}'),
                      child: SizedBox(
                        width: 84,
                        child: Column(children: [
                          Container(
                            width: 84,
                            height: 84,
                            decoration: BoxDecoration(color: Brand.tints[i % Brand.tints.length], borderRadius: BorderRadius.circular(Brand.r22)),
                            clipBehavior: Clip.antiAlias,
                            child: c.imageUrl != null
                                ? CachedNetworkImage(imageUrl: c.imageUrl!, fit: BoxFit.cover)
                                : Center(child: Text(c.name[0], style: const TextStyle(fontSize: 30, fontWeight: FontWeight.w800, color: Brand.violet))),
                          ),
                          const SizedBox(height: 6),
                          Text(c.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600)),
                        ]),
                      ),
                    );
                  },
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(child: _Row('Today’s deals', 'Limited time', const {'onSale': 'true', 'inStock': 'true', 'limit': '10'})),
          SliverToBoxAdapter(child: _Row('Best sellers', 'Trending now', const {'sort': 'popular', 'limit': '10'})),
          SliverToBoxAdapter(child: _Row('New arrivals', 'Just landed', const {'sort': 'newest', 'limit': '10'})),
          const SliverToBoxAdapter(child: SizedBox(height: 24)),
        ]),
      ),
    );
  }
}

class _Hero extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
        child: Container(
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(Brand.r28),
            gradient: const LinearGradient(colors: [Color(0xFF6447E6), Color(0xFF3B2390)], begin: Alignment.topLeft, end: Alignment.bottomRight),
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: Brand.yellow, borderRadius: BorderRadius.circular(20)),
              child: const Text('THIS WEEK', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800)),
            ),
            const SizedBox(height: 10),
            const Text('Top brands,\nup to 25% off',
                style: TextStyle(color: Colors.white, fontSize: 28, height: 1.05, fontWeight: FontWeight.w800, letterSpacing: -0.8)),
            const SizedBox(height: 6),
            const Text('Cash on delivery · Easy returns', style: TextStyle(color: Colors.white70)),
            const SizedBox(height: 14),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: Brand.ink, minimumSize: const Size(0, 44)),
              onPressed: () => context.push('/products?onSale=true&title=Deals'),
              child: const Text('Shop deals  →'),
            ),
          ]),
        ),
      );
}

/// A titled horizontal row of product tiles.
class _Row extends ConsumerWidget {
  const _Row(this.title, this.eyebrow, this.query);
  final String title;
  final String eyebrow;
  final Map<String, String> query;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(productsProvider(query));
    final params = Uri(queryParameters: {...query, 'title': title}..remove('limit')).query;
    return items.maybeWhen(
      orElse: () => const SizedBox.shrink(),
      loading: loading,
      data: (list) => list.isEmpty
          ? const SizedBox.shrink()
          : Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              SectionHead(title, eyebrow: eyebrow, onAll: () => context.push('/products?$params')),
              SizedBox(
                height: 292,
                child: ListView.separated(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  scrollDirection: Axis.horizontal,
                  itemCount: list.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 12),
                  itemBuilder: (_, i) => ProductTile(list[i], width: 168),
                ),
              ),
            ]),
    );
  }
}
