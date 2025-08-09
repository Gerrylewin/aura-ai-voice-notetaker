
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { HelpCircle, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const SupportRequestForm = () => {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    subject: '',
    category: '',
    description: '',
    priority: 'medium'
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ISAAC_USER_ID = '2b5e08e5-d585-4085-9c50-16fa8b43f458'; // Isaac's user ID

  const encryptMessage = (message: string): string => {
    return btoa(message); // Base64 encoding for simple encryption
  };

  const createChatWithIsaac = async (supportRequestId: string) => {
    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('chat_conversations')
        .select('id')
        .or(`and(participant1_id.eq.${user?.id},participant2_id.eq.${ISAAC_USER_ID}),and(participant1_id.eq.${ISAAC_USER_ID},participant2_id.eq.${user?.id})`)
        .single();

      let conversationId = existingConversation?.id;

      // Create conversation if it doesn't exist
      if (!conversationId) {
        const { data: newConversation, error: conversationError } = await supabase
          .from('chat_conversations')
          .insert({
            participant1_id: user?.id,
            participant2_id: ISAAC_USER_ID
          })
          .select()
          .single();

        if (conversationError) throw conversationError;
        conversationId = newConversation.id;
      }

      // Send welcome message
      const welcomeMessage = `Hi ${profile?.display_name || 'there'}! 👋

I've received your support request "${formData.subject}" and will be with you shortly to help resolve your issue.

In the meantime, feel free to provide any additional details here that might help me understand your situation better.

Request ID: ${supportRequestId}

Thanks for reaching out!
- Isaac`;

      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: ISAAC_USER_ID,
          encrypted_content: encryptMessage(welcomeMessage),
          message_type: 'text'
        });

      if (messageError) throw messageError;

      // Update conversation timestamp
      await supabase
        .from('chat_conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      return conversationId;
    } catch (error) {
      console.error('Failed to create chat with Isaac:', error);
      // Don't throw here - chat creation failure shouldn't block support request
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.subject || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting support request:', formData);

      // Save to database
      const { data: supportRequest, error: dbError } = await supabase
        .from('support_requests')
        .insert({
          user_id: user?.id || null,
          email: formData.email,
          subject: formData.subject,
          category: formData.category || null,
          priority: formData.priority,
          description: formData.description,
          status: 'open'
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to save support request to database');
      }

      console.log('Support request saved to database:', supportRequest);

      // Create chat with Isaac if user is logged in
      let chatCreated = false;
      if (user?.id) {
        const conversationId = await createChatWithIsaac(supportRequest.id);
        chatCreated = !!conversationId;
      }

      // Send email notification to Isaac
      try {
        const emailResponse = await supabase.functions.invoke('send-support-request-email', {
          body: {
            email: formData.email,
            subject: formData.subject,
            category: formData.category,
            priority: formData.priority,
            description: formData.description,
            userName: profile?.display_name || formData.email.split('@')[0],
            supportRequestId: supportRequest.id
          }
        });

        console.log('Email function response:', emailResponse);

        if (emailResponse.error) {
          console.error('Email function error:', emailResponse.error);
        } else {
          console.log('Email sent successfully');
        }
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }

      // Show success message
      toast({
        title: "Support Request Submitted Successfully!",
        description: chatCreated 
          ? "Your request has been submitted and a private chat with Isaac has been created. Check your messages!"
          : "Your request has been submitted and Isaac will get back to you within 24 hours.",
      });

      // Show confirmation state
      setIsSubmitted(true);

      // Reset form after a delay
      setTimeout(() => {
        setFormData({
          email: user?.email || '',
          subject: '',
          category: '',
          description: '',
          priority: 'medium'
        });
        setIsSubmitted(false);
      }, 5000);

    } catch (error) {
      console.error('Error submitting support request:', error);
      toast({
        title: "Error",
        description: "There was an error submitting your support request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show confirmation message if submitted
  if (isSubmitted) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Request Submitted Successfully!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Thank you for contacting us. We've received your support request.
          </p>
          {user?.id && (
            <div className="flex items-center justify-center gap-2 mb-4 text-blue-600 dark:text-blue-400">
              <MessageCircle className="w-5 h-5" />
              <p>A private chat with Isaac has been created - check your messages!</p>
            </div>
          )}
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            <strong>Isaac will get back to you within 24 hours.</strong>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            This form will reset automatically in a few seconds...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-gray-900 dark:text-white">
          <HelpCircle className="w-5 h-5 mr-2" />
          Submit a Support Request
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Describe your issue and we'll get back to you as soon as possible.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-gray-900 dark:text-white">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                required
                disabled={!!user?.email}
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-gray-900 dark:text-white">
                Category
              </Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="account">Account Issues</SelectItem>
                  <SelectItem value="onboarding">Onboarding Help</SelectItem>
                  <SelectItem value="payment">Payment & Billing</SelectItem>
                  <SelectItem value="content">Content Issues</SelectItem>
                  <SelectItem value="author-status">Author Status Questions</SelectItem>
                  <SelectItem value="story-competition">Story Competition</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="subject" className="text-gray-900 dark:text-white">
              Subject *
            </Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Brief description of your issue"
              className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <Label htmlFor="priority" className="text-gray-900 dark:text-white">
              Priority
            </Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
              <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-900 dark:text-white">
              Description *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide detailed information about your issue..."
              className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 min-h-[120px]"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            disabled={isSubmitting}
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Submitting...' : 'Submit Support Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
