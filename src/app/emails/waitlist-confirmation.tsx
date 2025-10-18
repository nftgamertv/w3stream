import { Body, Container, Head, Heading, Html, Preview, Section, Text } from "@react-email/components"

interface WaitlistConfirmationEmailProps {
  name: string
}

export default function WaitlistConfirmationEmail({ name }: WaitlistConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{"You're"} on the w3Stream waitlist!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to w3Stream</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Thank you for joining the w3Stream waitlist! {"We're"} thrilled to have you as part of our early community.
          </Text>
          <Section style={highlightBox}>
            <Text style={highlightText}>
              {"You're"} now on the list for exclusive early access to the next generation of live streaming.
            </Text>
          </Section>
          <Text style={text}>
            <strong>{"What's"} next?</strong>
          </Text>
          <Text style={text}>
            • {"We'll"} review your responses to understand your needs better
            <br />• {"You'll"} be among the first to know when we launch
            <br />• {"You'll"} get exclusive access to beta features
            <br />• {"We'll"} keep you updated on our progress
          </Text>
          <Text style={text}>
            In the meantime, if you have any questions or want to share more about your streaming needs, just reply to
            this email. We read every message.
          </Text>
          <Text style={text}>
            Thanks for believing in the future of streaming,
            <br />
            The w3Stream Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#f6f6f6",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
}

const h1 = {
  color: "#1a1a1a",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0 0 30px",
  padding: "0",
  lineHeight: "1.2",
}

const text = {
  color: "#404040",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px",
}

const highlightBox = {
  backgroundColor: "#f5f5f5",
  borderLeft: "4px solid #e67e50",
  padding: "20px",
  margin: "24px 0",
}

const highlightText = {
  color: "#1a1a1a",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
  fontWeight: "500",
}
