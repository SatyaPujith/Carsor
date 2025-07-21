'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Mic, BarChart3, MessageCircle, Wrench, Shield, Zap, Brain, Users, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  const features = [
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Voice AI Processing",
      description: "Advanced voice recognition with real-time AI analysis and instant issue categorization",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Smart Diagnostics",
      description: "AI-powered diagnostic engine that learns from patterns and predicts maintenance needs",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Predictive Analytics",
      description: "Advanced analytics dashboard with machine learning insights for service optimization",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Tata Certified Platform",
      description: "Official integration with Tata Motors ecosystem and authorized service network",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { number: "50K+", label: "Issues Resolved", icon: <Wrench className="w-6 h-6" /> },
    { number: "98%", label: "Accuracy Rate", icon: <Zap className="w-6 h-6" /> },
    { number: "15K+", label: "Active Users", icon: <Users className="w-6 h-6" /> },
    { number: "24/7", label: "AI Support", icon: <MessageCircle className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute -inset-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Car className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Carsor AI
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">Professional AI Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/auth/signin')}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 backdrop-blur-sm font-medium text-sm px-3 py-2 sm:px-4 sm:py-2"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => router.push('/auth/signup')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg font-medium text-sm px-3 py-2 sm:px-4 sm:py-2"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-16 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50/80 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-blue-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-700 font-medium">Professional AI Platform</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight px-4">
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Professional Vehicle
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Management System
              </span>
            </h1>
            
            <p className="text-base sm:text-xl text-slate-600 mb-8 sm:mb-12 leading-relaxed max-w-3xl mx-auto px-4">
              Enterprise-grade AI platform for Tata Motors. Advanced diagnostics, intelligent analytics, 
              and professional service management designed for automotive excellence.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
              <Button 
                size="lg" 
                onClick={() => router.push('/auth/signup')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg shadow-xl font-medium transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
              >
                <Car className="w-6 h-6 mr-3" />
                Start Professional Platform
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => router.push('/auth/signup')}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 backdrop-blur-sm px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-medium w-full sm:w-auto"
              >
                <Wrench className="w-6 h-6 mr-3" />
                Enterprise Access
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-md border-slate-200 text-center hover:bg-white/90 transition-all duration-300 shadow-lg">
                <CardContent className="p-3 sm:p-6">
                  <div className="flex justify-center mb-4 text-blue-600">
                    {stat.icon}
                  </div>
                  <div className="text-xl sm:text-3xl font-bold text-slate-800 mb-2">{stat.number}</div>
                  <div className="text-xs sm:text-sm text-slate-600 font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6 px-4">
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Enterprise AI Features
              </span>
            </h2>
            <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto px-4">
              Professional-grade artificial intelligence and advanced analytics 
              engineered for enterprise automotive service management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 px-2">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-md border-slate-200 hover:bg-white/90 transition-all duration-300 group overflow-hidden shadow-lg">
                <CardHeader className="pb-4 p-4 sm:p-6">
                  <div className={`inline-flex w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg sm:text-2xl text-slate-800 group-hover:text-blue-700 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <CardDescription className="text-slate-600 text-sm sm:text-lg leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24 bg-slate-100/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Professional Workflow
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                step: "01",
                title: "Advanced Input",
                description: "Professional voice recognition and intelligent data processing with enterprise-grade accuracy and contextual understanding.",
                icon: <Mic className="w-8 h-8" />
              },
              {
                step: "02", 
                title: "Enterprise Analytics",
                description: "Sophisticated machine learning algorithms provide comprehensive analysis with professional-grade diagnostic capabilities.",
                icon: <Brain className="w-8 h-8" />
              },
              {
                step: "03",
                title: "Professional Results",
                description: "Actionable insights and professional recommendations delivered through our enterprise management platform.",
                icon: <TrendingUp className="w-8 h-8" />
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-8">
                  <div className="w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 sm:w-8 h-6 sm:h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 group-hover:text-blue-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed px-4">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-md rounded-3xl p-16 border border-slate-200 shadow-xl">
            <h2 className="text-3xl sm:text-5xl font-bold text-slate-800 mb-6">
              Ready for Professional Excellence?
            </h2>
            <p className="text-base sm:text-xl text-slate-600 mb-12 max-w-3xl mx-auto px-4">
              Join the enterprise platform trusted by professionals. Experience the next generation 
              of automotive intelligence designed for business excellence.
            </p>
            <Button 
              size="lg" 
              onClick={() => router.push('/auth/signup')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl shadow-xl font-medium transform hover:scale-105 transition-all duration-200"
            >
              Access Professional Platform
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-white/80 backdrop-blur-md border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Carsor AI
            </span>
          </div>
          <p className="text-slate-600 mb-4">
            Professional automotive intelligence platform for Tata Motors
          </p>
          <p className="text-sm text-slate-500">
            Enterprise AI Platform • Professional Automotive Solutions
          </p>
        </div>
      </footer>
    </div>
  );
}