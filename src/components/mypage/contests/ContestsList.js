import React from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Grid, 
  Paper,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Import icons
import AddIcon from '@mui/icons-material/Add';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Import our new reusable ContestCard component
import ContestCard from '../../contest/ContestCard';

const ContestsList = ({ contests = [], user }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  const handleAddContest = () => {
    navigate('/contests/create');
  };

  const handleViewContest = (id) => {
    navigate(`/contests/${id}`);
  };
  
  const handleEditContest = (id) => {
    navigate(`/contest-edit/${id}`);
  };
  
  // Empty state component with enhanced styling
  const EmptyContests = () => (
    <Paper 
      elevation={0} 
      variant="outlined"
      sx={{ 
        padding: 4, 
        textAlign: 'center',
        borderRadius: 2,
        backgroundColor: 'rgba(0,0,0,0.01)',
        borderStyle: 'dashed',
        mb: 4
      }}
    >
      <EmojiEventsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.6 }} />
      <Typography variant="h6" color="textSecondary" gutterBottom>
        主催しているコンテストはありません
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
        あなたのコンテストを開催して、才能ある作家を募集しましょう。
        作品テーマを設定し、素晴らしい創作活動を促進できます。
      </Typography>
      <Button 
        variant="contained" 
        startIcon={<AddIcon />}
        onClick={handleAddContest}
        sx={{ 
          borderRadius: 6,
          px: 3
        }}
      >
        コンテストを作成する
      </Button>
    </Paper>
  );

  return (
    <Box>
      {/* Header section with enhanced styling */}
      <Box sx={{ mb: 5 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'start', sm: 'center' }, 
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold', 
                mb: { xs: 1, sm: 1 }
              }}
            >
              主催コンテスト
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ maxWidth: 500 }}
            >
              あなたが開催しているコンテスト一覧です。新しいコンテストを作成して、
              才能ある作家との出会いを広げましょう。
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddContest}
            sx={{ 
              borderRadius: 8,
              px: 3
            }}
          >
            新規作成
          </Button>
        </Box>
      </Box>

      {/* Contest grid with enhanced cards */}
      {contests.length > 0 ? (
        <Grid container spacing={3}>
          {contests.map((contest) => (
            <Grid item xs={12} sm={6} md={4} key={contest._id}>
              <ContestCard
                contest={contest}
                currentUserId={user?._id}
                onViewDetails={handleViewContest}
                onEdit={handleEditContest}
                buttonText="詳細を見る"
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyContests />
      )}
      
      {/* Bottom CTA if there are already contests */}
      {contests.length > 0 && (
        <Box textAlign="center" sx={{ mt: 5, mb: 3 }}>
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddContest}
            sx={{ 
              borderRadius: 8,
              px: 4
            }}
          >
            別のコンテストを作成する
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default React.memo(ContestsList);