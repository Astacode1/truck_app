#!/usr/bin/env python3
"""
Script to apply glassy theme to all pages uniformly
"""

# Common glassy theme patterns to apply
GLASSY_PATTERNS = {
    'page_container': 'className="min-h-screen" style={{ background: \'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)\' }}',
    
    'header_container': '''style={{ 
        background: 'rgba(15, 23, 42, 0.8)', 
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(34, 211, 238, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }} className="mb-8"''',
    
    'card_container': '''style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(34, 211, 238, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }} className="rounded-2xl"''',
    
    'input_style': '''style={{
          background: 'rgba(30, 41, 59, 0.5)',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          color: 'white'
        }}
        className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"''',
    
    'label': 'className="block text-sm font-medium text-white mb-2"',
    
    'primary_button': '''style={{
          background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
          boxShadow: '0 4px 15px rgba(34, 211, 238, 0.4)'
        }}
        className="px-6 py-3 rounded-xl text-white font-semibold hover:scale-105 transition-transform"''',
    
    'secondary_button': '''style={{
          background: 'rgba(148, 163, 184, 0.2)',
          border: '1px solid rgba(148, 163, 184, 0.3)'
        }}
        className="px-6 py-3 rounded-xl text-white hover:bg-opacity-30 transition-colors"''',
}

print("Glassy theme patterns ready to apply!")
print("Apply these patterns manually to each page component.")
print("\nKey replacements:")
print("1. Main container: Add gradient background")
print("2. Headers: Add glass effect with blur")
print("3. Cards/Tables: Add glass cards with borders")
print("4. Inputs: Dark transparent with light borders")
print("5. Labels: White text")
print("6. Buttons: Cyan gradient for primary, glass for secondary")
