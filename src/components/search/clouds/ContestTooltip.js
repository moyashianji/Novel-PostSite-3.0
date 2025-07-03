import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Popper, 
  Fade, 
  CircularProgress 
} from '@mui/material';
import ContestCard from "../../contest/ContestCard";

const ContestTooltip = ({ 
  hoveredContestTag,
  anchorEl,
  contestInfo,
  onTooltipMouseEnter,
  onTooltipMouseLeave,
  onClose
}) => {
  const navigate = useNavigate();
  
  const handleContestClick = (contestId) => {
    navigate(`/contests/${contestId}`);
    onClose();
  };
  
  const handleMoreClick = (tag) => {
    navigate(`/contests?tag=${encodeURIComponent(tag)}`);
    onClose();
  };
  
  return (
    <Popper
      open={Boolean(hoveredContestTag && anchorEl)}
      anchorEl={anchorEl}
      placement="bottom-start"
      transition
      style={{ zIndex: 9999 }}
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ]}
    >
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={200}>
          <Paper
            sx={{
              minWidth: 300,
              maxWidth: 400,
              p: 2,
              borderRadius: 2,
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              backgroundColor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              zIndex: 9999,
              position: 'relative',
            }}
            onMouseEnter={onTooltipMouseEnter}
            onMouseLeave={onTooltipMouseLeave}
          >
            {hoveredContestTag && contestInfo[hoveredContestTag] ? (
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  「{hoveredContestTag}」のコンテスト
                </Typography>
                {contestInfo[hoveredContestTag].length > 0 ? (
                  <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                    {contestInfo[hoveredContestTag].slice(0, 2).map((contest) => (
                      <Box 
                        key={contest._id} 
                        sx={{ 
                          mb: 2, 
                          '&:last-child': { mb: 0 },
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease',
                          '&:hover': {
                            transform: 'scale(1.02)'
                          }
                        }}
                        onClick={() => handleContestClick(contest._id)}
                      >
                        <ContestCard contest={contest} compact={true} />
                      </Box>
                    ))}
                    {contestInfo[hoveredContestTag].length > 2 && (
                      <Box
                        sx={{
                          mt: 1,
                          p: 1,
                          borderRadius: 1,
                          backgroundColor: 'action.hover',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'action.selected',
                            transform: 'translateY(-1px)'
                          }
                        }}
                        onClick={() => handleMoreClick(hoveredContestTag)}
                      >
                        <Typography variant="caption" color="primary.main" fontWeight="500">
                          他 {contestInfo[hoveredContestTag].length - 2} 件のコンテストを見る →
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    関連するコンテストが見つかりませんでした
                  </Typography>
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2">読み込み中...</Typography>
              </Box>
            )}
          </Paper>
        </Fade>
      )}
    </Popper>
  );
};

export default ContestTooltip;