import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, ExternalLink } from 'lucide-react';

interface ExternalLink {
  id: string;
  title: string;
  url: string;
  type: 'amazon' | 'portfolio' | 'social' | 'other';
}

interface ExternalLinksManagerProps {
  links: ExternalLink[];
  onChange: (links: ExternalLink[]) => void;
}

const linkTypes = [
  { value: 'amazon', label: 'Amazon Books' },
  { value: 'portfolio', label: 'Portfolio/Website' },
  { value: 'social', label: 'Social Media' },
  { value: 'other', label: 'Other' }
];

export function ExternalLinksManager({ links, onChange }: ExternalLinksManagerProps) {
  const [newLink, setNewLink] = useState({ title: '', url: '', type: 'other' as ExternalLink['type'] });

  const addLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) return;

    const link: ExternalLink = {
      id: Math.random().toString(36).substr(2, 9),
      title: newLink.title.trim(),
      url: newLink.url.trim(),
      type: newLink.type
    };

    onChange([...links, link]);
    setNewLink({ title: '', url: '', type: 'other' });
  };

  const removeLink = (id: string) => {
    onChange(links.filter(link => link.id !== id));
  };

  const updateLink = (id: string, field: keyof ExternalLink, value: string) => {
    onChange(links.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          External Links
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Links */}
        {links.map((link) => (
          <div key={link.id} className="flex gap-2 items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Link title"
                value={link.title}
                onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
              <Input
                placeholder="URL"
                value={link.url}
                onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
              <select
                value={link.type}
                onChange={(e) => updateLink(link.id, 'type', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {linkTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => removeLink(link.id)}
              className="mt-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {/* Add New Link */}
        <div className="border-t pt-4">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-900 dark:text-white">Title</Label>
                <Input
                  placeholder="e.g., My Amazon Author Page"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
              </div>
              <div>
                <Label className="text-gray-900 dark:text-white">Type</Label>
                <select
                  value={newLink.type}
                  onChange={(e) => setNewLink({ ...newLink, type: e.target.value as ExternalLink['type'] })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {linkTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label className="text-gray-900 dark:text-white">URL</Label>
              <Input
                placeholder="https://..."
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>
            <Button
              onClick={addLink}
              disabled={!newLink.title.trim() || !newLink.url.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Link
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
