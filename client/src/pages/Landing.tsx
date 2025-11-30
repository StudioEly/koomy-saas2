import { Link } from "wouter";
import { Smartphone, LayoutDashboard, Shield, QrCode, ArrowRight, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import koomyLogo from "@assets/Koomy-communitieslogo_1764495780161.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <img src={koomyLogo} alt="Koomy" className="h-16 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Koomy Prototype Portal</h1>
          <p className="text-slate-500 max-w-lg mx-auto text-lg">
            Select a persona below to explore the different interfaces of the Koomy Community Management Platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-8">
          {/* Member App */}
          <Card className="hover:shadow-xl transition-all duration-300 border-slate-200 group">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                <Smartphone className="text-blue-600 group-hover:text-white transition-colors" size={24} />
              </div>
              <CardTitle>Member App</CardTitle>
              <CardDescription>Mobile interface for community members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li className="flex items-center gap-2">• Multi-community Hub</li>
                <li className="flex items-center gap-2">• Digital Membership Card</li>
                <li className="flex items-center gap-2">• News & Events Feed</li>
              </ul>
              <Link href="/app/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 group-hover:shadow-lg group-hover:shadow-blue-200 transition-all">
                  Launch Mobile App <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Dashboard */}
          <Card className="hover:shadow-xl transition-all duration-300 border-slate-200 group">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                <LayoutDashboard className="text-purple-600 group-hover:text-white transition-colors" size={24} />
              </div>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>Web back-office for administrators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li className="flex items-center gap-2">• Member Management</li>
                <li className="flex items-center gap-2">• Content Publishing</li>
                <li className="flex items-center gap-2">• Event Organization</li>
              </ul>
              <Link href="/admin/dashboard">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 group-hover:shadow-lg group-hover:shadow-purple-200 transition-all">
                  Open Web Dashboard <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Mobile Admin */}
          <Card className="hover:shadow-xl transition-all duration-300 border-slate-200 group">
            <CardHeader>
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-slate-800 transition-colors">
                <Shield className="text-slate-600 group-hover:text-white transition-colors" size={24} />
              </div>
              <CardTitle>Mobile Admin</CardTitle>
              <CardDescription>On-the-go tools for delegates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li className="flex items-center gap-2">• QR Code Scanner</li>
                <li className="flex items-center gap-2">• Event Check-in</li>
                <li className="flex items-center gap-2">• Rapid Messaging</li>
              </ul>
              <Link href="/app/c_unsa/admin">
                <Button variant="outline" className="w-full hover:bg-slate-100 border-slate-300">
                  Launch Admin Tools <QrCode size={16} className="ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Platform Admin */}
          <Card className="hover:shadow-xl transition-all duration-300 border-slate-200 group relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">OWNER</div>
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-600 transition-colors">
                <BarChart className="text-orange-600 group-hover:text-white transition-colors" size={24} />
              </div>
              <CardTitle>SaaS Owner Portal</CardTitle>
              <CardDescription>Platform management for Super Owners</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-slate-600 mb-6">
                <li className="flex items-center gap-2">• Manage All Clients</li>
                <li className="flex items-center gap-2">• Global Activity View</li>
                <li className="flex items-center gap-2">• Revenue & Analytics</li>
              </ul>
              <Link href="/platform/dashboard">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 group-hover:shadow-lg group-hover:shadow-orange-200 transition-all">
                  Open Platform Portal <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-slate-400 text-sm pt-12">
          Koomy SaaS Platform Prototype v2.0 • Powered by Replit
        </div>
      </div>
    </div>
  );
}
