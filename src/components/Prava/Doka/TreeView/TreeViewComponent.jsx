import { useMemo, memo, useCallback, useState } from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Box, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

const TreeViewComponent = ({ data }) => {
    const [expandedItems, setExpandedItems] = useState([]);
    const [searchDate, setSearchDate] = useState(null);

    const getTreeData = useCallback((items) => {
        return items.reduce((acc, item) => {
            const date = dayjs(item.data_prikaza);
            const year = date.format("YYYY");
            const month = date.format("MMMM");
            const day = date.format("DD MMMM");
      
            if (!acc[year]) acc[year] = {};
            if (!acc[year][month]) acc[year][month] = {};
            if (!acc[year][month][day]) acc[year][month][day] = [];
            acc[year][month][day].push(item);
            return acc;
        }, {});
    }, []);

    const treeData = useMemo(() => getTreeData(data), [data, getTreeData]);

    const handleSearchDateChange = useCallback((newDate) => {
        setSearchDate(newDate);
        if (!newDate || !newDate.isValid()) return;
        const year = newDate.format("YYYY");
        const month = newDate.format("MMMM");
        const day = newDate.format("DD MMMM");
        const monthId = `${year}-${month}`;
        const dayId = `${year}-${month}-${day}`;
        const toExpand = [];
        if (treeData[year]) toExpand.push(year);
        if (treeData[year]?.[month]) toExpand.push(monthId);
        if (treeData[year]?.[month]?.[day]) toExpand.push(dayId);
        setExpandedItems(toExpand);
    }, [treeData]);
  
    return (
      <Box>
        <DatePicker
          label="Перейти к дате"
          value={searchDate}
          onChange={handleSearchDateChange}
          sx={{ mb: 1, minWidth: 200 }}
          slotProps={{ textField: { size: 'small' } }}
        />
        <SimpleTreeView
          aria-label="Дерево записей"
          expandedItems={expandedItems}
          onExpandedItemsChange={(e, itemIds) => setExpandedItems(itemIds)}
        >
        {Object.entries(treeData).map(([year, months]) => (
          <TreeItem itemId={year} label={year} key={year}>
            {Object.entries(months).map(([month, days]) => (
              <TreeItem itemId={`${year}-${month}`} label={month} key={month}>
                {Object.entries(days).map(([day, items]) => (
                  <TreeItem itemId={`${year}-${month}-${day}`} label={day} key={day}>
                    {items.map((item) => (
                      <TreeItem
                        itemId={item._id}
                        key={item._id}
                        label={
                          <Box sx={{display:'flex', gap:1}}>
                            (<Typography color='primary.main'>{item._pto.name}</Typography>) 
                            |<Typography color={item.type === 'Предоставить' ? 'success' : '#ed5353b0'}> {item.type} </Typography>
                            | <strong> {item._sotr.fio} </strong> 
                            (<Typography color='primary.main'>{item.lnp}</Typography>) - {item.obosnovanie} - 
                            <Typography color='primary.dark'>{item._who_do.name}</Typography>
                          </Box>
                        }
                      />
                    ))}
                  </TreeItem>
                ))}
              </TreeItem>
            ))}
          </TreeItem>
        ))}
      </SimpleTreeView>
      </Box>
    );
}

export default memo(TreeViewComponent);