module.exports = { 
  siteUrl: 'https://vidyapath.bhaihelp.in', 
  generateRobotsTxt: true, 
  sitemapSize: 7000, 
  changefreq: 'daily', 
  priority: 0.7, 
  exclude: ['/api/*'], 
  robotsTxtOptions: { 
    policies: [ 
      { userAgent: '*', allow: '/' }, 
      { userAgent: '*', disallow: ['/api/'] }, 
    ], 
  }, 
} 
