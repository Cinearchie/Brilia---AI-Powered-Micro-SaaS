import { ClerkProvider, SignUp } from '@clerk/nextjs'
import type { AppProps } from 'next/app'

function MyApp({ pageProps }: AppProps) {
  return (
    <ClerkProvider {...pageProps}>
      <SignUp
        appearance={{
          elements: {
            formButtonPrimary: {
              fontSize: 14,
              textTransform: 'none',
              backgroundColor: '#611BBD',
              '&:hover, &:focus, &:active': {
                backgroundColor: '#49247A',
              },
            },
          },
        }}
        
      />
    </ClerkProvider>
  )
}

export default MyApp