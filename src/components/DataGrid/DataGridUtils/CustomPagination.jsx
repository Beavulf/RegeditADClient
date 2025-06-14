import { memo } from 'react';
import { Box, Button, Pagination, PaginationItem } from '@mui/material';
import { useGridApiContext, useGridSelector, gridPageSelector, gridPageCountSelector  } from '@mui/x-data-grid';
;


const CustomPagination = () => {
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPageCountSelector);
  
    const handleFirstPage = () => {
      apiRef.current.setPage(0);
    };
  
    const handleLastPage = () => {
      apiRef.current.setPage(pageCount - 1);
    };
  
    const handlePageChange = (event, value) => {
      apiRef.current.setPage(value - 1);
    };
  
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding:'0 5px'}}>
        <Button onClick={handleFirstPage} disabled={page === 0}>
          start
        </Button>
        <Pagination
            color="primary"
            count={pageCount}
            page={page + 1}
            onChange={handlePageChange}
            sx={{display: 'flex', alignItems: 'center' }}
            renderItem={(item) =>
                item.type === 'previous' || item.type === 'next' ? (
                <PaginationItem {...item} />
                ) : (
                null
                )
            }
        />
        <Button onClick={handleLastPage} disabled={page >= pageCount - 1}>
          end
        </Button>
      </Box>
    );
}
  
export default memo(CustomPagination);