import { Image as UnpicImage } from '@unpic/react/base'
import type { ImageProps as UnpicImageProps } from '@unpic/react/base'
import type { Operations } from 'unpic'

const ASSET_HOST = 'image.bdgcafe.com'

function watermarkTransformer(src: string | URL, { width }: Operations): string {
  const url = new URL(String(src))
  if (url.hostname === ASSET_HOST && width) {
    url.searchParams.set('w', String(Math.round(Number(width))))
  }
  return url.toString()
}

type DistributiveOmit<T, TKey extends PropertyKey> = T extends unknown
  ? Omit<T, TKey>
  : never

export type ImageProps = DistributiveOmit<
  UnpicImageProps<Operations, undefined>,
  'transformer'
>

export default function Image(props: ImageProps) {
  return <UnpicImage transformer={watermarkTransformer} unstyled {...props} />
}
