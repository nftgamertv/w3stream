import { Body, Container, Head, Heading, Html, Preview, Section, Text, Hr } from "@react-email/components"

interface WaitlistConfirmationEmailProps {
  name: string
}

export default function WaitlistConfirmationEmail({ name }: WaitlistConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{"You're"} on the w3Stream waitlist - Welcome to the future of collaboration</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with brand */}
          <Section style={header}>
            <Text style={logo}>w3Stream</Text>
            <Text style={tagline}>Next-Gen Collaboration</Text>
          </Section>

          {/* Hero section */}
          <Section style={heroSection}>
            <Heading style={h1}>{"You're"} In! 🚀</Heading>
            <Text style={heroText}>Welcome to the future of live streaming, {name}</Text>
          </Section>

          {/* Main content */}
          <Section style={contentSection}>
            <Text style={text}>
              Thank you for joining the w3Stream waitlist. {"You're"} now part of an exclusive community shaping the
              next generation of collaborative streaming technology.
            </Text>

            {/* Highlight box */}
            <Section style={highlightBox}>
              <Text style={highlightTitle}>What This Means for You</Text>
              <Text style={highlightText}>
                {"You're"} positioned for early access to revolutionary streaming features that will transform how teams
                collaborate and create content together.
              </Text>
            </Section>

            {/* Benefits list */}
            <Section style={benefitsSection}>
              <Text style={benefitsTitle}>Your Early Access Benefits:</Text>

              <Section style={benefitItem}>
                <Text style={benefitIcon}>⚡</Text>
                <Text style={benefitText}>
                  <strong style={benefitStrong}>Priority Access</strong>
                  <br />
                  <span style={benefitDescription}>Be among the first to experience our platform when we launch</span>
                </Text>
              </Section>

              <Section style={benefitItem}>
                <Text style={benefitIcon}>🎯</Text>
                <Text style={benefitText}>
                  <strong style={benefitStrong}>Exclusive Beta Features</strong>
                  <br />
                  <span style={benefitDescription}>Test cutting-edge collaboration tools before anyone else</span>
                </Text>
              </Section>

              <Section style={benefitItem}>
                <Text style={benefitIcon}>💬</Text>
                <Text style={benefitText}>
                  <strong style={benefitStrong}>Direct Input</strong>
                  <br />
                  <span style={benefitDescription}>Shape the platform with your feedback and suggestions</span>
                </Text>
              </Section>

              <Section style={benefitItem}>
                <Text style={benefitIcon}>📢</Text>
                <Text style={benefitText}>
                  <strong style={benefitStrong}>Launch Updates</strong>
                  <br />
                  <span style={benefitDescription}>
                    Stay informed with exclusive progress reports and announcements
                  </span>
                </Text>
              </Section>
            </Section>

            <Hr style={divider} />

            {/* Next steps */}
            <Text style={text}>
              <strong style={strongText}>{"What's"} Next?</strong>
            </Text>
            <Text style={text}>
              {"We're"} reviewing your responses to better understand your streaming needs. {"You'll"} hear from us soon
              with updates on our progress and your early access timeline.
            </Text>

            <Text style={text}>
              Have questions or want to share more about your collaboration needs? Just reply to this email - we read
              every message and value your input.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={footerDivider} />
            <Text style={footerText}>
              Thanks for believing in the future of streaming,
              <br />
              <strong>The w3Stream Team</strong>
            </Text>
            <Text style={copyright}>© 2025 w3Stream, Inc. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Main styles
const main = {
  backgroundColor: "#0a0a0a",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: "40px 20px",
}

const container = {
  backgroundColor: "#111111",
  margin: "0 auto",
  maxWidth: "600px",
  border: "1px solid #1a1a1a",
  borderRadius: "12px",
  overflow: "hidden",
}

// Header styles
const header = {
  backgroundColor: "#0a0a0a",
  padding: "32px 40px 24px",
  textAlign: "center" as const,
  borderBottom: "1px solid #1a1a1a",
}

const logo = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#ffffff",
  margin: "0 0 8px",
  letterSpacing: "-0.5px",
}

const tagline = {
  fontSize: "13px",
  color: "#00d9ff",
  margin: "0",
  textTransform: "uppercase" as const,
  letterSpacing: "1.5px",
  fontWeight: "600",
}

// Hero section
const heroSection = {
  padding: "40px 40px 32px",
  textAlign: "center" as const,
  background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
}

const h1 = {
  color: "#ffffff",
  fontSize: "36px",
  fontWeight: "bold",
  margin: "0 0 16px",
  lineHeight: "1.2",
  letterSpacing: "-0.5px",
}

const heroText = {
  color: "#a855f7",
  fontSize: "18px",
  margin: "0",
  fontWeight: "500",
}

// Content section
const contentSection = {
  padding: "32px 40px",
}

const text = {
  color: "#d4d4d4",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 20px",
}

const strongText = {
  color: "#ffffff",
  fontWeight: "600",
}

// Highlight box
const highlightBox = {
  backgroundColor: "#1a1a1a",
  border: "2px solid #00d9ff",
  borderRadius: "8px",
  padding: "24px",
  margin: "28px 0",
}

const highlightTitle = {
  color: "#00d9ff",
  fontSize: "14px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 12px",
}

const highlightText = {
  color: "#ffffff",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
  fontWeight: "500",
}

// Benefits section
const benefitsSection = {
  margin: "28px 0",
}

const benefitsTitle = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 20px",
}

const benefitItem = {
  display: "flex" as const,
  marginBottom: "20px",
  alignItems: "flex-start" as const,
}

const benefitIcon = {
  fontSize: "24px",
  margin: "0 16px 0 0",
  lineHeight: "1",
}

const benefitText = {
  flex: "1",
  margin: "0",
}

const benefitStrong = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  display: "block",
  marginBottom: "4px",
}

const benefitDescription = {
  color: "#a3a3a3",
  fontSize: "14px",
  lineHeight: "20px",
}

// Divider
const divider = {
  borderColor: "#1a1a1a",
  margin: "32px 0",
}

// Footer
const footer = {
  padding: "0 40px 40px",
}

const footerDivider = {
  borderColor: "#1a1a1a",
  margin: "0 0 24px",
}

const footerText = {
  color: "#a3a3a3",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 20px",
  textAlign: "center" as const,
}

const copyright = {
  color: "#525252",
  fontSize: "13px",
  textAlign: "center" as const,
  margin: "0",
}
