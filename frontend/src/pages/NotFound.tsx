import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Fade,
  Slide,
  Grow,
  Avatar,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  ArrowBack,
  ErrorOutline,
  SentimentDissatisfied,
} from '@mui/icons-material';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="md">
        <Slide direction="up" in={animate} timeout={800}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              overflow: 'visible',
              textAlign: 'center',
            }}
          >
            <CardContent sx={{ p: 6 }}>
              <Fade in={animate} timeout={1200}>
                <Box sx={{ mb: 4 }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mb: 3,
                      bgcolor: 'error.main',
                    }}
                  >
                    <ErrorOutline sx={{ fontSize: 60 }} />
                  </Avatar>
                  <Typography
                    variant="h1"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '4rem', md: '6rem' },
                      color: 'error.main',
                      mb: 2,
                    }}
                  >
                    404
                  </Typography>
                  <Typography
                    variant="h3"
                    component="h2"
                    gutterBottom
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    Oops! Page Not Found
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    paragraph
                    sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}
                  >
                    The page you are looking for might have been removed, had its name changed,
                    or is temporarily unavailable.
                  </Typography>
                </Box>
              </Fade>

              <Grow in={animate} timeout={1600}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    component={RouterLink}
                    to="/"
                    variant="contained"
                    size="large"
                    startIcon={<Home />}
                    sx={{
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                      },
                    }}
                  >
                    Go Home
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        color: 'primary.dark',
                      },
                    }}
                  >
                    Go Back
                  </Button>
                </Box>
              </Grow>

              <Fade in={animate} timeout={2000}>
                <Box sx={{ mt: 6, p: 3, bgcolor: 'grey.50', borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Need Help?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    If you believe this is an error, please contact our support team.
                  </Typography>
                </Box>
              </Fade>
            </CardContent>
          </Card>
        </Slide>
      </Container>
    </Box>
  );
};

export default NotFound; 