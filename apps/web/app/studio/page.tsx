'use client';

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Upload, Video as VideoIcon, BarChart3, Settings, DollarSign, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const navItems = [
    { name: 'Dashboard', icon: BarChart3 },
    { name: 'Content', icon: VideoIcon },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Community', icon: MessageSquare },
    { name: 'Monetization', icon: DollarSign },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex flex-1">
        <aside className="w-64 border-r hidden md:flex flex-col bg-card">
          <div className="p-6 flex flex-col items-center border-b">
            <div className="h-20 w-20 rounded-full bg-secondary" />
            <h3 className="font-semibold mt-3 text-center">Your Channel</h3>
          </div>
          <nav className="flex-1 py-4">
             {navItems.map(item => (
               <Button 
                 key={item.name}
                 variant={activeTab === item.name ? "secondary" : "ghost"} 
                 className={`w-full justify-start rounded-none px-6 h-12 ${activeTab === item.name ? 'border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
                 onClick={() => setActiveTab(item.name)}
               >
                 <item.icon className="mr-3 h-5 w-5" /> {item.name}
               </Button>
             ))}
          </nav>
        </aside>
        
        <main className="flex-1 p-8 bg-muted/10 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">{activeTab}</h1>
            <Button onClick={() => setActiveTab('Upload')}><Upload className="h-4 w-4 mr-2" /> Upload Video</Button>
          </div>
          
          {activeTab === 'Dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border bg-card p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-lg mb-2">Latest video performance</h3>
                <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center text-xs">Thumbnail</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Views</span> <span className="font-medium">1,234</span></div>
                  <div className="flex justify-between text-sm"><span>Impressions CTR</span> <span className="font-medium">8.2%</span></div>
                  <div className="flex justify-between text-sm"><span>Avg. view duration</span> <span className="font-medium">4:20</span></div>
                </div>
              </div>
              
              <div className="border bg-card p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-lg mb-4">Channel analytics</h3>
                <p className="text-sm text-muted-foreground mb-4">Current subscribers</p>
                <p className="text-4xl font-bold mb-6">124,592</p>
                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm font-medium">Summary (Last 28 days)</p>
                  <div className="flex justify-between text-sm"><span>Views</span> <span className="text-green-500 font-medium">+1.2M</span></div>
                  <div className="flex justify-between text-sm"><span>Watch time</span> <span className="text-green-500 font-medium">+100K hr</span></div>
                  <div className="flex justify-between text-sm"><span>Estimated revenue</span> <span className="text-green-500 font-medium">+$4,200</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Content' && (
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b flex gap-4"><Button variant="secondary" size="sm">Videos</Button><Button variant="ghost" size="sm">Shorts</Button><Button variant="ghost" size="sm">Live</Button></div>
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-3 font-medium">Video</th>
                    <th className="px-6 py-3 font-medium">Visibility</th>
                    <th className="px-6 py-3 font-medium">Monetization</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {[1,2,3].map(i => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="px-6 py-4 flex gap-4">
                        <div className="w-32 aspect-video bg-muted rounded" />
                        <div><p className="font-medium">Video Title {i}</p><p className="text-xs text-muted-foreground mt-1">Add description...</p></div>
                      </td>
                      <td className="px-6 py-4"><span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">Public</span></td>
                      <td className="px-6 py-4"><span className="text-green-600 font-medium">$ On</span></td>
                      <td className="px-6 py-4">Oct 24, 2026</td>
                      <td className="px-6 py-4">12,400</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Upload' && (
            <div className="border-2 border-dashed border-border rounded-2xl h-96 flex flex-col items-center justify-center bg-card">
              <Upload className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">Drag and drop video files to upload</h3>
              <p className="text-sm text-muted-foreground mb-6">Your videos will be private until you publish them.</p>
              <Button>Select Files</Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
