import Grid from "@material-ui/core/Grid";
import React, { useEffect, useMemo, useState } from "react";
import { Typography, CircularProgress } from "@material-ui/core";
import BBChart from "../BBChart";
import { donut, pie } from "billboard.js";
import { getAllComponents, getMeshModels, getRelationshipsDetail, fetchCategories, getModelFromCategoryApi } from "../../api/meshmodel";
import { dataToColors } from "../../utils/charts";
import Link from "next/link";

const useFetchTotal = (fetchr) => {
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchr().then((json) => {
      setTotal(json["total_count"]);
      setLoading(false);
    }).catch(e => {
      console.log("Api Error : ", e);
      setLoading(false);
    });
  }, []);

  return [total, loading];
}

const spinnerStyle = {
  display : 'flex',
  justifyContent : 'center',
  alignItems : 'center',
  height : '250px' // Increased from 200px to 250px for larger y-axis dimension
};

function MeshModelContructs({ classes }) {
  const [totalModels, loadingModels] = useFetchTotal(() => getMeshModels(1, 1));
  const [totalComponents, loadingComponents] = useFetchTotal(() => getAllComponents(1, 1));
  const [totalRelationships, loadingRelationships] = useFetchTotal(() => getRelationshipsDetail(1, 1));

  const data = useMemo(() => {
    return [
      ["Models", totalModels],
      ["Components", totalComponents],
      ["Relationships", totalRelationships]
    ];
  }, [totalModels, totalRelationships, totalComponents]);

  const chartOptions = useMemo(() => ({
    data : {
      columns : data,
      type : donut(),
      colors : dataToColors(data),
    },
    // ... other configurations as needed
  }), [data]);

  return (
    <div className={classes.dashboardSection}>
      <Link href="/settings#meshmodel-summary">
        <Typography variant="h6" gutterBottom className={classes.link}>
          Models
        </Typography>
      </Link>
      <div style={spinnerStyle}>
        {(loadingModels || loadingComponents || loadingRelationships) ? <CircularProgress /> : <BBChart options={chartOptions} />}
      </div>
    </div>
  );
}

function MeshModelCategories({ classes }) {
  const [categoryMap, setCategoryMap] = useState({});
  const [loading, setLoading] = useState(true);

  const cleanedData = useMemo(() => Object.keys(categoryMap).map((key) => ([key, categoryMap[key]])), [categoryMap]);

  const chartOptions = useMemo(() => ({
    data : {
      columns : cleanedData,
      colors : dataToColors(cleanedData),
      type : pie(),
      labels : false  // This removes labels from the pie slices
    },
    tooltip : {
      format : {
        value : function (v) {
          return `${v} Models`;
        }
      }
    },
    legend : {
      show : false
    }
  }), [cleanedData]);

  useEffect(() => {
    fetchCategories().then((categoriesJson) => {
      const promises = categoriesJson['categories'].map((category) => {
        let categoryName = category.name;
        return getModelFromCategoryApi(categoryName).then((modelsJson) => {
          setCategoryMap((prevState) => ({ ...prevState, [categoryName] : modelsJson["total_count"] }));
        });
      });

      Promise.all(promises).then(() => {
        setLoading(false);
      });
    }).catch(e => {
      console.log("Api Error : ", e);
      setLoading(false);
    });
  }, []);

  return (
    <div className={classes.dashboardSection}>
      <Link href="/settings#meshmodel-summary">
        <Typography variant="h6" gutterBottom className={classes.link}>
          Model Categories
        </Typography>
      </Link>
      <div style={spinnerStyle}>
        {loading ? <CircularProgress /> : <BBChart options={chartOptions} />}
      </div>
    </div>
  );
}

const MeshModelGraph = ({ classes }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <MeshModelCategories classes={classes} />
      </Grid>
      <Grid item xs={12} md={6}>
        <MeshModelContructs classes={classes} />
      </Grid>
    </Grid>
  );
}

MeshModelGraph.displayName = "MeshModalGraph";
export default MeshModelGraph;
