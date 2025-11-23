"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-black text-white relative">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1000ms' }} />
      </div>

      {/* Hero Section */}
      <section className="py-24 px-4 border-b border-slate-800 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-cyan-500 via-purple-500 to-teal-500 bg-clip-text text-transparent mb-6">
            Terms of Service
          </h1>
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-4xl mx-auto prose prose-invert prose-slate max-w-none">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="space-y-8 text-slate-300"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing or using w3Stream ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service. We reserve the right to modify these Terms at any time, and your continued use of the Service constitutes acceptance of any changes.
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">2. Description of Service</h2>
              <p className="leading-relaxed">
                w3Stream is a next-generation live streaming and collaboration platform that enables users to create, share, and interact within interactive 2D and 3D spaces. Our services include but are not limited to live streaming, real-time collaboration, AI agent integration, and decentralized content distribution.
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">3. User Accounts and Registration</h2>
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.1 Account Creation</h3>
              <p className="leading-relaxed mb-4">
                To access certain features of the Service, you may be required to create an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">3.2 Account Security</h3>
              <p className="leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">4. Acceptable Use</h2>
              <p className="leading-relaxed mb-4">You agree not to use the Service to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others, including intellectual property rights</li>
                <li>Transmit harmful, offensive, or illegal content</li>
                <li>Engage in harassment, abuse, or discrimination</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Use automated systems to access the Service without authorization</li>
                <li>Impersonate any person or entity</li>
                <li>Collect or harvest information about other users</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">5. Content and Intellectual Property</h2>
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.1 Your Content</h3>
              <p className="leading-relaxed mb-4">
                You retain ownership of any content you create, upload, or share through the Service ("Your Content"). By using the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute Your Content solely for the purpose of providing and improving the Service.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">5.2 Our Content</h3>
              <p className="leading-relaxed">
                All content, features, and functionality of the Service, including but not limited to text, graphics, logos, and software, are owned by w3Stream or its licensors and are protected by copyright, trademark, and other intellectual property laws.
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">6. Blockchain and Cryptocurrency</h2>
              <p className="leading-relaxed mb-4">
                Our Service may integrate with blockchain networks and cryptocurrency functionality. You acknowledge that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cryptocurrency transactions are irreversible and cannot be refunded</li>
                <li>You are solely responsible for the security of your wallet and private keys</li>
                <li>We are not responsible for any losses resulting from blockchain transactions</li>
                <li>Cryptocurrency values are volatile and subject to market fluctuations</li>
                <li>You must comply with all applicable laws regarding cryptocurrency in your jurisdiction</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">7. Payment and Fees</h2>
              <p className="leading-relaxed">
                Certain features of the Service may require payment. You agree to pay all fees associated with your use of paid features. Fees are non-refundable unless otherwise stated. We reserve the right to change our pricing at any time, with reasonable notice to existing users.
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">8. Privacy</h2>
              <p className="leading-relaxed">
                Your use of the Service is also governed by our <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300 underline transition-colors">Privacy Policy</Link>. Please review our Privacy Policy, which explains how we collect, use, and protect your information.
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">9. Disclaimers and Limitation of Liability</h2>
              <h3 className="text-xl font-semibold text-white mt-6 mb-3">9.1 Service Availability</h3>
              <p className="leading-relaxed mb-4">
                The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, secure, or error-free.
              </p>

              <h3 className="text-xl font-semibold text-white mt-6 mb-3">9.2 Limitation of Liability</h3>
              <p className="leading-relaxed">
                To the maximum extent permitted by law, w3Stream shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">10. Indemnification</h2>
              <p className="leading-relaxed">
                You agree to indemnify, defend, and hold harmless w3Stream and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising out of your use of the Service, violation of these Terms, or infringement of any rights of another.
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">11. Termination</h2>
              <p className="leading-relaxed mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including if you breach these Terms. Upon termination:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your right to use the Service will immediately cease</li>
                <li>We may delete your account and content</li>
                <li>All provisions of these Terms that by their nature should survive termination will survive</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">12. Governing Law and Dispute Resolution</h2>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which w3Stream operates, without regard to its conflict of law provisions. Any disputes arising out of or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with applicable arbitration rules.
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">13. Changes to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the modified Terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">14. Contact Information</h2>
              <p className="leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="leading-relaxed mt-4">
                <strong>Email:</strong> support@w3stream.com
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Back to Home */}
      <section className="py-8 px-4 relative z-10 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </section>
    </main>
  )
}

