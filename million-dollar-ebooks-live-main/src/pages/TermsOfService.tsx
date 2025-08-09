import React from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead 
        seo={{
          title: 'Terms of Service - Million Dollar eBooks',
          description: 'Read the terms and conditions for using Million Dollar eBooks platform.'
        }}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
        <Header />
        
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
              <p className="text-gray-600 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="prose prose-lg max-w-none dark:prose-invert">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
                <p className="mb-4">
                  By accessing and using Million Dollar eBooks ("the Platform"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
                <p className="mb-4">
                  Million Dollar eBooks is a digital platform that connects readers with independent authors, offering affordable ebooks (typically $1) and fostering a community around reading and writing.
                </p>
                <p className="mb-4">Our platform provides:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Access to a curated library of ebooks</li>
                  <li>Tools for authors to publish and promote their work</li>
                  <li>Social features including messaging, reviews, and recommendations</li>
                  <li>Reading progress tracking and gamification</li>
                  <li>Payment processing for book purchases and author royalties</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Account Registration</h2>
                <p className="mb-4">To use our platform, you must:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Be at least 13 years old</li>
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">User Content and Conduct</h2>
                <h3 className="text-xl font-medium mb-3">Content Guidelines</h3>
                <p className="mb-4">Users may not post content that:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Violates any laws or regulations</li>
                  <li>Infringes on intellectual property rights</li>
                  <li>Contains hate speech, harassment, or threats</li>
                  <li>Includes adult content without appropriate labeling</li>
                  <li>Promotes illegal activities</li>
                  <li>Contains spam or misleading information</li>
                </ul>
                
                <h3 className="text-xl font-medium mb-3">Author Responsibilities</h3>
                <p className="mb-4">Authors publishing on our platform must:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Own or have rights to all content they publish</li>
                  <li>Provide accurate book descriptions and metadata</li>
                  <li>Respect intellectual property rights</li>
                  <li>Comply with content guidelines</li>
                  <li>Respond to legitimate reader concerns</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Payments and Pricing</h2>
                <h3 className="text-xl font-medium mb-3">Book Purchases</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Most books are priced at $1.00</li>
                  <li>Payments are processed securely through Stripe</li>
                  <li>All sales are final unless otherwise specified</li>
                  <li>Refunds may be granted at our discretion for technical issues</li>
                </ul>
                
                <h3 className="text-xl font-medium mb-3">Author Royalties</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Authors receive a percentage of book sales after platform fees</li>
                  <li>Royalties are paid through Stripe Connect</li>
                  <li>Payment schedules and minimum thresholds apply</li>
                  <li>Tax reporting is the author's responsibility</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Privacy and Communications</h2>
                <p className="mb-4">
                  Our platform includes messaging features that use basic encryption (Base64 encoding) for privacy protection. While we implement security measures, users should be aware that:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Messages are encrypted before storage</li>
                  <li>We do not monitor private conversations</li>
                  <li>Users are responsible for their communications</li>
                  <li>Harassment or abuse should be reported immediately</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
                <p className="mb-4">
                  The platform itself, including its design, features, and branding, is owned by Million Dollar eBooks. User-generated content remains the property of its creators, but users grant us a license to host, display, and distribute their content through our platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Platform Availability</h2>
                <p className="mb-4">
                  We strive to maintain platform availability but do not guarantee uninterrupted service. We reserve the right to:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Perform maintenance and updates</li>
                  <li>Modify or discontinue features</li>
                  <li>Suspend accounts for violations</li>
                  <li>Remove content that violates our guidelines</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
                <p className="mb-4">
                  Million Dollar eBooks is provided "as is" without warranties. We are not liable for:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Indirect, incidental, or consequential damages</li>
                  <li>Loss of data or content</li>
                  <li>Third-party actions or content</li>
                  <li>Service interruptions</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Termination</h2>
                <p className="mb-4">
                  We may terminate or suspend accounts for violations of these terms. Users may close their accounts at any time. Upon termination:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Access to the platform will be revoked</li>
                  <li>User content may be removed</li>
                  <li>Outstanding payments will be processed according to our policies</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
                <p className="mb-4">
                  We reserve the right to update these Terms of Service. Users will be notified of significant changes, and continued use of the platform constitutes acceptance of updated terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
                <p className="mb-4">
                  These terms are governed by applicable laws. Any disputes will be resolved through appropriate legal channels.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
                <p className="mb-4">
                  For questions about these Terms of Service, please contact us through our platform's support system.
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
