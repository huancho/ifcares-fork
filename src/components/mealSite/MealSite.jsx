import React, { useEffect, useState, useContext } from 'react';
import { Table } from 'flowbite-react';
import MealSiteRow from '../mealSiteRow/MealSiteRow';
import SitesDropdown from '../sitesDropdown/SitesDropdown';
import axios from 'axios';
import './MealSite.css';
import useAuth from '../../hooks/useAuth';
import { ROLES } from '../../constants';
import { MealSiteContext } from '../mealSiteProvider/MealSiteProvider';

import useIsMobile from '../../hooks/useIsMobile';
import MealList from '../mealList/MealList';
import LoadingSpinner from '../loadingSpinner/LoadingSpinner';
import dayjs from 'dayjs';

const MealSite = () => {
  const [sites, setSites] = useState([]);
  const { auth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    selectedSite,
    setSelectedSite,
    setSelectedDate,
    setLastTimeIn,
    setLastTimeOut,
    siteData,
    setSiteData,
    setStudentData,
    resetGlobalCounts,
    resetSelectedCheckboxData,
    resetSelectedDate,
    resetDateValidationError,
    isDataFetched,
    setIsDataFetched,
  } = useContext(MealSiteContext);

  const isMobile = useIsMobile();

  const handleSiteChange = (newSite) => {
    setSelectedSite(newSite);
    resetGlobalCounts(); // Reset the counts when the site changes
    resetSelectedCheckboxData();
    resetSelectedDate(); // Reset the date picker value
    resetDateValidationError();
  };

  const GAS_URL =
    'https://script.google.com/macros/s/AKfycbxwfq6r4ZHfN6x66x2Ew-U16ZWnt0gfrhScaZmsNpyKufbRj2n1Zc3UH8ZEFXbA-F8V/exec';

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const { data: sitesData } = await axios.get(GAS_URL + '?type=sites');

        if (auth == null) {
          return;
        }

        if (auth.role === ROLES.Admin) {
          setSites(sitesData);
        } else {
          const userSite = sitesData.find(
            (site) => site.name === auth.assignedSite
          );
          if (userSite) {
            setSites([userSite]);
            handleSiteChange(userSite.name); // Automatically select the site
          }
        }
      } catch (error) {
        console.error('Error fetching sites:', error);
      }
    };

    if (auth == null) {
      return;
    }

    if (auth.role === ROLES.Admin || !isDataFetched) {
      fetchSites();
      setIsDataFetched(true); // For admin, consider setting this to false when component unmounts
    }

    // Adding cleanup to reset isDataFetched for admin users
    return () => {
      if (auth == null) {
        return;
      }
      if (auth.role === ROLES.Admin) {
        setIsDataFetched(false);
      }
    };
  }, [auth, isDataFetched, setIsDataFetched]);

  const fetchDataForSelectedSite = (site) => {
    setIsLoading(true);
    // Make an API request with the selected site as a parameter
    axios
      .get(GAS_URL + `?type=siteData&site=${site}`)
      .then((response) => {
        setSiteData(response.data);
        setLastTimeIn(response.data.lastTimeIn);
        setLastTimeOut(response.data.lastTimeOut);
      })
      .catch((error) => {
        console.error('Error fetching site data:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // When the selected site changes, fetch data for the new site
  useEffect(() => {
    if (selectedSite) {
      fetchDataForSelectedSite(selectedSite);
    }
  }, [selectedSite]);

  const fetchStudentForSelectedSite = (site) => {
    setIsLoading(true);
    // Make an API request with the selected site as a parameter
    axios
      .get(GAS_URL + `?type=studentData&site=${site}`)
      .then((response) => {
        setStudentData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching site data:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (selectedSite) {
      fetchStudentForSelectedSite(selectedSite);
    }
  }, [selectedSite]);
  const [dropdownDisabled, setdropdownDisabled] = useState(null);
  useEffect(() => {
    if (auth != null) {
      setdropdownDisabled(auth.role !== ROLES.Admin);
    }
  }, [auth]);

  // capture the values of the parameters in URL
  const [queryParams, setQueryParams] = useState({ site: null, date: null });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const site = searchParams.get('site');
    const date = searchParams.get('date');
    setQueryParams({ site, date });
    // Now you can use queryParams.date and queryParams.site as needed
  }, []);

  function formatDateForPicker(dateStr) {
    return dayjs(dateStr);
  }

  useEffect(() => {
    if (queryParams.site && queryParams.date) {
      // Logic to handle the parameters
      setSelectedSite(queryParams.site);
      let formattedDate = formatDateForPicker(queryParams.date);
      console.log(formattedDate);
      setSelectedDate(formattedDate);

      console.log(
        `Received date: ${queryParams.date} and site: ${queryParams.site}`
      );
    }
  }, [queryParams]);

  return (
    <div className="relative left-1/2 -translate-x-1/2 w-4/5">
      <div className="flex items-center">
        <SitesDropdown
          sites={sites}
          onSiteSelected={handleSiteChange}
          selectedSite={selectedSite}
          additionalStyles={{
            border: 'solid 1px #3DED97',
            // backgroundColor: '#D3D3D3',
            pointerEvents: dropdownDisabled ? 'none' : 'auto', // Disable pointer events if dropdown is disabled
            // cursor: dropdownDisabled ? 'not-allowed' : 'default',
            // opacity: dropdownDisabled ? 0.4 : 1,
          }}
          disableAllSites={true}
        />
        {isLoading && <LoadingSpinner />}
      </div>
      <br />
      {isMobile ? (
        <div className="w-full rounded-lg bg-white mb-4 shadow p-4">
          <p className="font-bold text-lg"> Name of Contracting Entity (CE)</p>
          <p className="text-lg">{siteData.name}</p>
          <br />

          <p className="font-bold text-lg">CE ID</p>
          <p className="text-lg">{siteData.ceId}</p>
          <br />

          <p className="font-bold text-lg"> Name of Site</p>
          <p className="text-lg">{siteData.siteName}</p>
          <br />

          <p className="font-bold text-lg">Site #</p>
          <p className="text-lg">{siteData.siteNumber}</p>
          <br />
        </div>
      ) : (
        <Table>
          <Table.Head>
            <Table.HeadCell className="text-black text-base font-semibold leading-relaxed min-h-[85px] bg-[#e8fdf5] border-b-2 border-black">
              Name of Contracting Entity (CE)
            </Table.HeadCell>
            <Table.HeadCell className="text-black text-base font-semibold leading-relaxed min-h-[85px] bg-[#e8fdf5] border-b-2 border-black">
              CE ID
            </Table.HeadCell>
            <Table.HeadCell className="text-black text-base font-semibold leading-relaxed min-h-[85px] bg-[#e8fdf5] border-b-2 border-black">
              Name of Site
            </Table.HeadCell>
            <Table.HeadCell className="text-black text-base font-semibold leading-relaxed min-h-[85px] bg-[#e8fdf5] border-b-2 border-black">
              Site #
            </Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            <MealSiteRow siteData={siteData} />
          </Table.Body>
        </Table>
      )}

      <br />
      <MealList></MealList>
    </div>
  );
};

export default MealSite;
