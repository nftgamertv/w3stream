import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Hr,
  Tailwind,
} from "@react-email/components"

interface WaitlistConfirmationEmailProps {
  name: string
}

export default function WaitlistConfirmationEmail({ name }: WaitlistConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to w3Stream - {"You're"} on the waitlist for the future of immersive streaming</Preview>
      <Tailwind>
        <Body style={main}>
          <Container style={container}>
            {/* Header with logo */}
            <Section style={header}>
              <Img
                src="/images/design-mode/w3Stream_banner_line.png"
                alt="w3Stream"
                width="280"
                height="auto"
                style={logoImage}
              />
            </Section>

            {/* Hero section with gradient */}
            <Section style={heroSection}>
              <Heading style={h1}>
                {"Thank you"} {name}!
              </Heading>
              <Text style={heroText}>
                Welcome to the (r)evolution of live streaming and collaboration
              </Text>
            </Section>

            {/* Main content */}
            <Section style={contentSection}>
              <Text style={text}>
                Thank you for joining the waitlist for the w3Stream private beta. {"If selected, you'll"} now be a part of an exclusive community
                building the future where creators, communities, and agentic AI come together in interactive 2D and 3D
                spaces.
              </Text>

              {/* Highlight box */}
              <Section style={highlightBox}>
                <Text style={highlightTitle}>
                Early Access Awaits        
                </Text>
                <Text style={highlightText}>
                  {"You're"} positioned for priority access to immersive streaming experiences that go far beyond the
                  traditional livestream. Get ready to create, collaborate, and connect in entirely new ways.
                </Text>
              </Section>

              {/* Benefits grid */}
              <Section style={benefitsSection}>
                <Text style={sectionTitle}>
                  What {"You'll"} Get
                </Text>

                <table style={benefitsGrid} cellPadding="0" cellSpacing="0">
                  <tbody>
                    <tr>
                      <td style={benefitCell}>
                        <Text style={benefitIcon}>⚡</Text>
                        <Text style={benefitTitle}>Priority Access</Text>
                        <Text style={benefitDescription}>
                          Be among the first to experience our revolutionary platform when we launch
                        </Text>
                      </td>
                      <td style={benefitCell}>
                        <Text style={benefitIcon}>🎮</Text>
                        <Text style={benefitTitle}>Interactive Spaces</Text>
                        <Text style={benefitDescription}>
                          Explore immersive 2D and 3D environments designed for next-gen collaboration
                        </Text>
                      </td>
                    </tr>
                    <tr>
                      <td style={benefitCell}>
                        <Text style={benefitIcon}>🤖</Text>
                        <Text style={benefitTitle}>AI Integration</Text>
                        <Text style={benefitDescription}>
                          Work alongside agentic AI that enhances your creative and collaborative workflows
                        </Text>
                      </td>
                      <td style={benefitCell}>
                        <Text style={benefitIcon}>💬</Text>
                        <Text style={benefitTitle}>Shape the Future</Text>
                        <Text style={benefitDescription}>
                          Your feedback will directly influence platform features and capabilities
                        </Text>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Section>

              <Hr style={divider} />

              {/* Next steps */}
              <Section style={nextStepsSection}>
                <Text style={sectionTitle}>
                  {"What's"} Next?
                </Text>
                <Text style={text}>
                  {"We're"} carefully reviewing all applications to ensure the best possible beta experience. {"If selected, you'll"}{" "}
                  receive updates on:
                </Text>

                <Section style={stepsList}>
                  <Text style={stepItem}>
                    <span style={stepNumber}>1</span>
                    <span style={stepText}>Your beta access timeline and onboarding details</span>
                  </Text>
                  <Text style={stepItem}>
                    <span style={stepNumber}>2</span>
                    <span style={stepText}>Exclusive platform previews and feature announcements</span>
                  </Text>
                  <Text style={stepItem}>
                    <span style={stepNumber}>3</span>
                    <span style={stepText}>Early community events and collaboration opportunities</span>
                  </Text>
                </Section>

                <Text style={text}>
                  This is an automated confirmation. For questions or to connect with our community, join us on{" "}
                  <a href="https://discord.gg/cVmT5TRM6j" style={link}>
                    Discord
                  </a>{" "}
                  or follow us on{" "}
                  <a href="https://x.com/w3stream" style={link}>
                    X
                  </a>
                  .
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Section style={footer}>
              <Hr style={footerDivider} />
              <Text style={footerText}>
                Welcome to the future of streaming,
                <br />
                <strong style={footerStrong}>The w3Stream Team</strong>
              </Text>
              <Text style={socialLinks}>
                <a href="https://discord.gg/cVmT5TRM6j" style={socialLink}>
                  Discord
                </a>
                {" • "}
                <a href="https://x.com/w3stream" style={socialLink}>
                  X
                </a>
              </Text>
              <Text style={copyright}>© 2025 w3Stream, Inc. All rights reserved.</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
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
  backgroundColor: "#0f172a",
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 20px 60px rgba(0, 217, 255, 0.1)",
}

// Header styles
const header = {
  backgroundColor: "#0a0a0a",
  padding: "40px 40px 32px",
  textAlign: "center" as const,
  borderBottom: "1px solid rgba(0, 217, 255, 0.1)",
}

const logoImage = {
  margin: "0 auto",
  display: "block",
}

// Hero section with gradient accent
const heroSection = {
  padding: "48px 40px",
  textAlign: "center" as const,
  background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
  borderBottom: "2px solid transparent",
  borderImage: "linear-gradient(90deg, #00d9ff 0%, #a855f7 100%) 1",
}

const h1 = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "700",
  margin: "0 0 16px",
  lineHeight: "1.2",
  letterSpacing: "-0.5px",
}

const heroText = {
  color: "#00d9ff",
  fontSize: "18px",
  margin: "0",
  fontWeight: "500",
  lineHeight: "1.5",
}

// Content section
const contentSection = {
  padding: "40px 40px 32px",
}

const text = {
  color: "#cbd5e1",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 20px",
  textAlign: "left" as const,
}

const sectionTitle = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0 0 24px",
  letterSpacing: "-0.3px",
}

// Highlight box with gradient border
const highlightBox = {
  backgroundColor: "#1e293b",
  border: "2px solid transparent",
  borderImage: "linear-gradient(135deg, #00d9ff 0%, #a855f7 100%) 1",
  borderRadius: "12px",
  padding: "28px",
  margin: "32px 0",
}

const highlightTitle = {
  color: "#00d9ff",
  fontSize: "16px",
  fontWeight: "700",
  margin: "0 0 12px",
  letterSpacing: "0.5px",
}

const highlightText = {
  color: "#f1f5f9",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0",
  fontWeight: "500",
}

// Benefits grid
const benefitsSection = {
  margin: "40px 0 32px",
}

const benefitsGrid = {
  width: "100%",
  borderCollapse: "separate" as const,
  borderSpacing: "16px",
}

const benefitCell = {
  backgroundColor: "#1e293b",
  padding: "24px",
  borderRadius: "12px",
  verticalAlign: "top" as const,
  width: "50%",
  border: "1px solid rgba(100, 116, 139, 0.2)",
}

const benefitIcon = {
  fontSize: "32px",
  margin: "0 0 12px",
  lineHeight: "1",
  display: "block",
}

const benefitTitle = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
  margin: "0 0 8px",
  display: "block",
}

const benefitDescription = {
  color: "#94a3b8",
  fontSize: "14px",
  lineHeight: "1.5",
  margin: "0",
  display: "block",
}

// Divider
const divider = {
  borderColor: "rgba(100, 116, 139, 0.2)",
  margin: "40px 0",
}

// Next steps section
const nextStepsSection = {
  margin: "32px 0",
}

const stepsList = {
  margin: "24px 0",
}

const stepItem = {
  color: "#cbd5e1",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 16px",
  display: "block",
}

const stepNumber = {
  display: "inline-block",
  width: "28px",
  height: "28px",
  backgroundColor: "#00d9ff",
  color: "#0a0a0a",
  borderRadius: "50%",
  textAlign: "center" as const,
  lineHeight: "28px",
  fontSize: "14px",
  fontWeight: "700",
  marginRight: "12px",
  verticalAlign: "middle",
}

const stepText = {
  verticalAlign: "middle",
}

// Footer
const footer = {
  padding: "0 40px 40px",
}

const footerDivider = {
  borderColor: "rgba(100, 116, 139, 0.2)",
  margin: "0 0 32px",
}

const footerText = {
  color: "#94a3b8",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "0 0 16px",
  textAlign: "center" as const,
}

const footerStrong = {
  color: "#cbd5e1",
  fontWeight: "600",
}

const copyright = {
  color: "#64748b",
  fontSize: "13px",
  textAlign: "center" as const,
  margin: "0",
}

const link = {
  color: "#00d9ff",
  textDecoration: "none",
  fontWeight: "600",
}

const socialLinks = {
  color: "#94a3b8",
  fontSize: "14px",
  textAlign: "center" as const,
  margin: "0 0 16px",
}

const socialLink = {
  color: "#00d9ff",
  textDecoration: "none",
  fontWeight: "500",
}