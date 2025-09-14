
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/seo/SEOHead';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead 
        seo={{
          title: 'Privacy Policy - Million Dollar eBooks',
          description: 'Learn how Million Dollar eBooks protects your privacy and handles your personal information.'
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
              <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-gray-600 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="prose prose-lg max-w-none dark:prose-invert">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
                <p className="mb-4">
                  Million Dollar eBooks ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
                <h3 className="text-xl font-medium mb-3">Personal Information</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Account information (email address, display name)</li>
                  <li>Profile information (avatar, bio, external links)</li>
                  <li>Payment information (processed securely through Stripe)</li>
                  <li>Content you create (books, reviews, comments)</li>
                </ul>
                
                <h3 className="text-xl font-medium mb-3">Usage Information</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Reading progress and preferences</li>
                  <li>Platform interaction data</li>
                  <li>Device and browser information</li>
                  <li>IP address and location data</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Chat and Messaging Security</h2>
                <p className="mb-4">
                  Your privacy in communications is important to us. All chat messages on our platform are encrypted using Base64 encoding before being stored in our database. While this provides a layer of protection against casual viewing, please note:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Messages are encrypted before storage</li>
                  <li>Only authorized users in a conversation can view decrypted messages</li>
                  <li>We do not read or monitor your private conversations</li>
                  <li>Messages can be permanently deleted by users</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                <ul className="list-disc pl-6 mb-4">
                  <li>Provide and improve our services</li>
                  <li>Process payments and transactions</li>
                  <li>Personalize your reading experience</li>
                  <li>Send important notifications about your account</li>
                  <li>Prevent fraud and ensure platform security</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
                <p className="mb-4">We do not sell your personal information. We may share information in these circumstances:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>With your consent</li>
                  <li>With service providers (Supabase for database, Stripe for payments)</li>
                  <li>To comply with legal requirements</li>
                  <li>To protect our rights and prevent fraud</li>
                  <li>In connection with a business transfer</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
                <p className="mb-4">
                  We implement appropriate security measures to protect your information, including:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Encrypted data transmission (HTTPS)</li>
                  <li>Secure database hosting with Supabase</li>
                  <li>Regular security updates and monitoring</li>
                  <li>Limited access to personal information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
                <p className="mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and data</li>
                  <li>Export your data</li>
                  <li>Opt out of marketing communications</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
                <p className="mb-4">
                  We use cookies and similar technologies to enhance your experience, remember your preferences, and analyze platform usage. You can control cookie settings through your browser.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
                <p className="mb-4">Our platform integrates with:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Supabase (database and authentication)</li>
                  <li>Stripe (payment processing)</li>
                  <li>Google (optional document import)</li>
                </ul>
                <p className="mb-4">These services have their own privacy policies that govern their use of your information.</p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
                <p className="mb-4">
                  Our platform is not intended for children under 13. We do not knowingly collect personal information from children under 13.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
                <p className="mb-4">
                  We may update this Privacy Policy periodically. We will notify you of significant changes by posting the new policy on our platform and updating the "Last updated" date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <p className="mb-4">
                  If you have questions about this Privacy Policy or how we handle your information, please contact us through our platform's support system.
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
