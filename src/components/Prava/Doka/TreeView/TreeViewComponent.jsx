import { useMemo, memo, useCallback } from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Box, Typography } from '@mui/material';

import dayjs from 'dayjs';
import 'dayjs/locale/ru'
dayjs.locale('ru');

const TreeViewComponent = ({ data }) => {

    const getTreeData = useCallback((items) => {
        return items.reduce((acc, item) => {
            const date = dayjs(item.data_prikaza);
            const year = date.format("YYYY");
            const month = date.format("MMMM");
            const day = date.format("DD MMMM");
      
            if (!acc[year]) {
                acc[year] = {};
            }
            if (!acc[year][month]) {
                acc[year][month] = {};
            }
            if (!acc[year][month][day]) {
                acc[year][month][day] = [];
            }
            acc[year][month][day].push(item);
            return acc;
        }, {});
    }, []);

    const treeData = useMemo(() => getTreeData(data), [data, getTreeData]);
  
    return (
      <SimpleTreeView aria-label="Дерево записей">
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
                          <Box sx={{display:'flex'}}>
                            (<Typography color='aqua'>{item._pto.name}</Typography>)|<Typography color={item.type === 'Предоставить' ? 'lightGreen' : '#ed5353b0'}> {item.type} </Typography>| <strong> {item._sotr.fio} </strong> (<Typography color='aqua'>{item.lnp}</Typography>) - {item.obosnovanie} - <Typography color='lightBlue'>{item._who_do.name}</Typography>
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
    );
}

export default memo(TreeViewComponent);