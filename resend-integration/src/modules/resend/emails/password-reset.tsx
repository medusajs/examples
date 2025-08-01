import { 
  Text, 
  Container, 
  Heading, 
  Html, 
  Section, 
  Tailwind, 
  Head, 
  Preview, 
  Body, 
  Link,
  Button 
} from "@react-email/components"

type PasswordResetEmailProps = {
  reset_url: string
  email?: string
}

function PasswordResetEmailComponent({ reset_url, email }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                Reset Your Password
              </Heading>
            </Section>

            <Section className="my-[32px]">
              <Text className="text-black text-[14px] leading-[24px]">
                Hello{email ? ` ${email}` : ''},
              </Text>
              <Text className="text-black text-[14px] leading-[24px]">
                We received a request to reset your password. Click the button below to create a new password for your account.
              </Text>
            </Section>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={reset_url}
              >
                Reset Password
              </Button>
            </Section>

            <Section className="my-[32px]">
              <Text className="text-black text-[14px] leading-[24px]">
                Or copy and paste this URL into your browser:
              </Text>
              <Link
                href={reset_url}
                className="text-blue-600 no-underline text-[14px] leading-[24px] break-all"
              >
                {reset_url}
              </Link>
            </Section>

            <Section className="my-[32px]">
              <Text className="text-[#666666] text-[12px] leading-[24px]">
                This password reset link will expire soon for security reasons.
              </Text>
              <Text className="text-[#666666] text-[12px] leading-[24px] mt-2">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </Text>
            </Section>

            <Section className="mt-[32px] pt-[20px] border-t border-solid border-[#eaeaea]">
              <Text className="text-[#666666] text-[12px] leading-[24px]">
                For security reasons, never share this reset link with anyone. If you're having trouble with the button above, copy and paste the URL into your web browser.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export const passwordResetEmail = (props: PasswordResetEmailProps) => (
  <PasswordResetEmailComponent {...props} />
)

// Mock data for preview/development
const mockPasswordReset: PasswordResetEmailProps = {
  reset_url: "https://your-app.com/reset-password?token=sample-reset-token-123",
  email: "user@example.com"
}

export default () => <PasswordResetEmailComponent {...mockPasswordReset} />
