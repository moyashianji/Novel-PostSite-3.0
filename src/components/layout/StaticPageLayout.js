// src/components/layout/StaticPageLayout.js
import React from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Breadcrumbs,
  Link,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { 
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon 
} from '@mui/icons-material';

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(6),
  minHeight: '80vh'
}));

const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    margin: theme.spacing(0, 1)
  }
}));

const PageHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -theme.spacing(2),
    left: '50%',
    transform: 'translateX(-50%)',
    width: 60,
    height: 3,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: 2
  }
}));

const LastUpdated = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.5),
  backgroundColor: alpha(theme.palette.info.main, 0.1),
  borderRadius: theme.spacing(1),
  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
  textAlign: 'center'
}));

const StaticPageLayout = ({ 
  title, 
  subtitle, 
  children, 
  lastUpdated,
  breadcrumbItems = []
}) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const defaultBreadcrumbs = [
    { label: 'ホーム', path: '/', icon: <HomeIcon sx={{ fontSize: 16 }} /> },
    ...breadcrumbItems,
    { label: title, path: null }
  ];

  return (
    <PageContainer maxWidth="md">
      {/* パンくずリスト */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ 
            '& .MuiBreadcrumbs-separator': { 
              color: theme.palette.text.secondary 
            }
          }}
        >
          {defaultBreadcrumbs.map((item, index) => {
            const isLast = index === defaultBreadcrumbs.length - 1;
            
            if (isLast || !item.path) {
              return (
                <Typography 
                  key={index}
                  color="text.primary" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    fontWeight: isLast ? 'bold' : 'normal'
                  }}
                >
                  {item.icon && <Box sx={{ mr: 0.5 }}>{item.icon}</Box>}
                  {item.label}
                </Typography>
              );
            }
            
            return (
              <Link
                key={index}
                color="inherit"
                onClick={() => navigate(item.path)}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                {item.icon && <Box sx={{ mr: 0.5 }}>{item.icon}</Box>}
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      </Box>

      <ContentPaper elevation={0}>
        <PageHeader>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.text.primary,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            {title}
          </Typography>
          
          {subtitle && (
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                fontWeight: 'normal',
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              {subtitle}
            </Typography>
          )}
        </PageHeader>

        <Divider sx={{ mb: 4, opacity: 0.6 }} />

        <Box sx={{ 
          '& h2': { 
            marginTop: theme.spacing(4), 
            marginBottom: theme.spacing(2),
            color: theme.palette.primary.main,
            fontWeight: 'bold'
          },
          '& h3': { 
            marginTop: theme.spacing(3), 
            marginBottom: theme.spacing(1.5),
            color: theme.palette.text.primary
          },
          '& p': { 
            marginBottom: theme.spacing(2),
            lineHeight: 1.7,
            fontSize: '1rem'
          },
          '& ul, & ol': {
            marginBottom: theme.spacing(2),
            paddingLeft: theme.spacing(3)
          },
          '& li': {
            marginBottom: theme.spacing(0.5),
            lineHeight: 1.6
          }
        }}>
          {children}
        </Box>

        {lastUpdated && (
          <LastUpdated variant="body2">
            最終更新日: {new Date(lastUpdated).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </LastUpdated>
        )}
      </ContentPaper>
    </PageContainer>
  );
};

export default StaticPageLayout;