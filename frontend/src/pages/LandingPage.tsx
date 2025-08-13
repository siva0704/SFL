import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Fade,
  Slide,
  Grow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Link as RouterLink,
  useNavigate,
} from 'react-router-dom';
import {
  Factory,
  TrendingUp,
  Security,
  Analytics,
  Speed,
  Support,
  ArrowForward,
  CheckCircle,
  Star,
  Business,
  Engineering,
  Assessment,
  Inventory,
} from '@mui/icons-material';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  const features = [
    {
      icon: <Factory />,
      title: 'Production Management',
      description: 'Streamline your manufacturing processes with real-time monitoring and control.',
      color: '#4caf50',
    },
    {
      icon: <Inventory />,
      title: 'Inventory Control',
      description: 'Track materials, components, and finished goods with precision.',
      color: '#2196f3',
    },
    {
      icon: <Engineering />,
      title: 'Maintenance Scheduling',
      description: 'Preventive maintenance and equipment health monitoring.',
      color: '#ff9800',
    },
    {
      icon: <Assessment />,
      title: 'Quality Assurance',
      description: 'Comprehensive quality control and defect tracking system.',
      color: '#9c27b0',
    },
    {
      icon: <Analytics />,
      title: 'Advanced Analytics',
      description: 'Data-driven insights to optimize your operations.',
      color: '#f44336',
    },
    {
      icon: <Security />,
      title: 'Enterprise Security',
      description: 'Multi-tenant architecture with role-based access control.',
      color: '#607d8b',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Operations Manager',
      company: 'TechCorp Manufacturing',
      content: 'The Factory Management System has transformed our production efficiency by 40%.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Plant Director',
      company: 'Global Industries',
      content: 'Real-time monitoring and predictive maintenance have reduced downtime by 60%.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Quality Manager',
      company: 'Precision Manufacturing',
      content: 'The quality control features have helped us achieve 99.9% defect-free production.',
      rating: 5,
    },
  ];

  const stats = [
    { value: '500+', label: 'Companies Trust Us' },
    { value: '99.9%', label: 'Uptime Guarantee' },
    { value: '40%', label: 'Efficiency Improvement' },
    { value: '24/7', label: 'Support Available' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Slide direction="right" in={animate} timeout={800}>
                <Box>
                  <Typography
                    variant="h2"
                    component="h1"
                    gutterBottom
                    sx={{ fontWeight: 700, mb: 3 }}
                  >
                    Transform Your
                    <br />
                    <Box component="span" sx={{ color: '#ffd700' }}>
                      Factory Operations
                    </Box>
                  </Typography>
                  <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                    Comprehensive multi-tenant SaaS platform for manufacturing companies
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      component={RouterLink}
                      to="/register"
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForward />}
                      sx={{
                        bgcolor: '#ffd700',
                        color: '#333',
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 600,
                        '&:hover': {
                          bgcolor: '#ffed4e',
                        },
                      }}
                    >
                      Get Started Free
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/login"
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#ffd700',
                          color: '#ffd700',
                        },
                      }}
                    >
                      Sign In
                    </Button>
                  </Box>
                </Box>
              </Slide>
            </Grid>
            <Grid item xs={12} md={6}>
              <Slide direction="left" in={animate} timeout={1000}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 200,
                      height: 200,
                      mx: 'auto',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Factory sx={{ fontSize: 80 }} />
                  </Avatar>
                </Box>
              </Slide>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Grow in={animate} timeout={1200 + index * 200}>
                <Card
                  sx={{
                    textAlign: 'center',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Fade in={animate} timeout={1400}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                Powerful Features
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Everything you need to manage your factory efficiently
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Grow in={animate} timeout={1600 + index * 200}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          width: 64,
                          height: 64,
                          mx: 'auto',
                          mb: 3,
                          bgcolor: feature.color,
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Fade in={animate} timeout={1800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              What Our Customers Say
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Join hundreds of satisfied manufacturing companies
            </Typography>
          </Box>
        </Fade>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Slide direction="up" in={animate} timeout={2000 + index * 300}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} sx={{ color: '#ffd700', fontSize: 20 }} />
                      ))}
                    </Box>
                    <Typography variant="body1" sx={{ mb: 3, fontStyle: 'italic' }}>
                      "{testimonial.content}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {testimonial.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role} at {testimonial.company}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Slide>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Fade in={animate} timeout={2200}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                Ready to Transform Your Factory?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Start your free trial today and see the difference
              </Typography>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  bgcolor: '#ffd700',
                  color: '#333',
                  px: 6,
                  py: 2,
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: '#ffed4e',
                  },
                }}
              >
                Start Free Trial
              </Button>
            </Box>
          </Fade>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 