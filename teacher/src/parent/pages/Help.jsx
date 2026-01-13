import { HelpCircle, Mail, Phone, MessageCircle, BookOpen } from 'lucide-react';
import Card from '../components/Card';

const Help = () => {
  const faqs = [
    {
      question: 'How do I view my child\'s daily activities?',
      answer: 'Navigate to the Activities page from the bottom navigation or dashboard to see all daily activities and updates from teachers.',
    },
    {
      question: 'Where can I see photos and videos?',
      answer: 'Go to the Media page to browse all photos and videos shared by teachers from school activities.',
    },
    {
      question: 'How do I track my child\'s meals?',
      answer: 'Visit the Meals page to see daily meal records, including what your child ate and any special dietary notes.',
    },
    {
      question: 'Can I update my profile information?',
      answer: 'Yes, go to Settings from the top menu or Profile page to update your contact information and preferences.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-sm">Help & Support</h1>
        <p className="text-white/90 drop-shadow-sm">Find answers to common questions and get support</p>
      </div>

      {/* Contact Information */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          Contact Us
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">support@uchqunplatform.com</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium text-gray-900">+1 (555) 123-4567</p>
            </div>
          </div>
        </div>
      </Card>

      {/* FAQ Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600 text-sm">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a href="/activities" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            View Activities →
          </a>
          <a href="/media" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Browse Media →
          </a>
          <a href="/meals" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Check Meals →
          </a>
          <a href="/settings" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            Account Settings →
          </a>
        </div>
      </Card>
    </div>
  );
};

export default Help;

