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

type UserInvitedEmailProps = {
  invite_url: string
  email?: string
}

function UserInvitedEmailComponent({ invite_url, email }: UserInvitedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to join our platform</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                You're Invited!
              </Heading>
            </Section>

            <Section className="my-[32px]">
              <Text className="text-black text-[14px] leading-[24px]">
                Hello{email ? ` ${email}` : ''},
              </Text>
              <Text className="text-black text-[14px] leading-[24px]">
                You've been invited to join our platform. Click the button below to accept your invitation and set up your account.
              </Text>
            </Section>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={invite_url}
              >
                Accept Invitation
              </Button>
            </Section>

            <Section className="my-[32px]">
              <Text className="text-black text-[14px] leading-[24px]">
                Or copy and paste this URL into your browser:
              </Text>
              <Link
                href={invite_url}
                className="text-blue-600 no-underline text-[14px] leading-[24px] break-all"
              >
                {invite_url}
              </Link>
            </Section>

            <Section className="mt-[32px]">
              <Text className="text-[#666666] text-[12px] leading-[24px]">
                If you weren't expecting this invitation, you can ignore this email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export const userInvitedEmail = (props: UserInvitedEmailProps) => (
  <UserInvitedEmailComponent {...props} />
)

// Mock data for preview/development
const mockInvite: UserInvitedEmailProps = {
  invite_url: "https://your-app.com/app/invite/sample-token-123",
  email: "user@example.com"
}

export default () => <UserInvitedEmailComponent {...mockInvite} />
