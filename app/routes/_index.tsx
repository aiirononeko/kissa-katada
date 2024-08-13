import { format } from '@formkit/tempo'
import { LoaderFunctionArgs } from '@remix-run/cloudflare'
import type { MetaFunction } from '@remix-run/cloudflare'
import { Link } from '@remix-run/react'
import { createClient } from 'microcms-js-sdk'
import { typedjson, useTypedLoaderData } from 'remix-typedjson'
import { Badge } from '~/components/ui/badge'

export const meta: MetaFunction = () => {
  return [
    { title: 'トップページ | 片田舎のカタダ' },
    { name: 'description', content: 'Welcome to Remix!' },
  ]
}

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const { env } = context.cloudflare

  const client = createClient({
    serviceDomain: env.MICROCMS_SERVICE_DOMAIN,
    apiKey: env.MICROCMS_API_KEY,
  })

  const response = await client.getList<Blog>({
    endpoint: 'blogs',
  })
  return typedjson({ response })
}

export default function Index() {
  const { response } = useTypedLoaderData<typeof loader>()
  const { contents } = response

  return (
    <div className='container mx-auto w-full max-w-[1120px] py-10'>
      {contents.length > 0 ? (
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {contents.map((content) => (
            <Link to={`/articles/${content.id}`} key={content.id}>
              <div className='border col-span-1'>
                <img
                  src={content.eyecatch.url}
                  width={content.eyecatch.width}
                  height={content.eyecatch.height}
                />
                <div className='p-4 space-y-2'>
                  <div>
                    {content.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant='outline'
                        className='h-8 tracking-wider'
                      >
                        # {tag.name}
                      </Badge>
                    ))}
                  </div>
                  <p className='h-16 font-semibold'>{content.title}</p>
                  <p className='text-muted-foreground text-end tracking-wider text-sm'>
                    {format(content.createdAt, 'YYYY/MM/DD')}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div>
          <p className='text-muted-foreground'>記事が見つかりません</p>
        </div>
      )}
    </div>
  )
}
