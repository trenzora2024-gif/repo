import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import type {ProductCardFragment} from 'storefrontapi.generated';
import {
  FirstDrop,
  Hero,
  MakeItYours,
  OneDesignYourWay,
  PeopleOfTrenzora,
  Ticker,
  Trending,
  VibeSection,
  WeeklyDrop,
} from '~/components/home/HomeSections';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import {organizationJsonLd, seoMeta, websiteJsonLd} from '~/lib/seo';
import {SITE} from '~/data/site';

export const meta: Route.MetaFunction = () =>
  seoMeta({
    title: `${SITE.name} — ${SITE.positioning}`,
    description: SITE.description,
    path: '/',
    jsonLd: [organizationJsonLd(), websiteJsonLd()],
  });

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  const data = await storefront.query(HOME_QUERY, {
    cache: storefront.CacheShort(),
  });

  const drop = data.drop?.nodes ?? [];
  const trending = data.trending?.products.nodes ?? [];
  const byHandle = Object.fromEntries(drop.map((p) => [p.handle, p]));

  return {
    mumbai: drop
      .filter((p) => p.tags.includes('design:mumbai-made'))
      .slice(0, 3),
    trending: (trending.length ? trending : drop).slice(0, 8),
    byHandle,
  };
}

export default function Homepage() {
  const {mumbai, trending, byHandle} = useLoaderData<typeof loader>();
  return (
    <>
      <Hero />
      <Ticker />
      <VibeSection />
      <FirstDrop products={mumbai} />
      <MakeItYours />
      <OneDesignYourWay
        imagesByHandle={byHandle as Record<string, ProductCardFragment>}
      />
      <Trending products={trending} />
      <PeopleOfTrenzora />
      <WeeklyDrop />
    </>
  );
}

const HOME_QUERY = `#graphql
  query Home($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    drop: products(first: 60, query: "tag:'drop:01'") {
      nodes {
        ...ProductCard
      }
    }
    trending: collection(handle: "trending") {
      products(first: 8) {
        nodes {
          ...ProductCard
        }
      }
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
` as const;
