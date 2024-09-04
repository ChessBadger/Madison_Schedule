document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const searchForm = document.getElementById('searchForm');
  const signOutButton = document.getElementById('signOutButton');
  const searchInputGroup = document.getElementById('searchInputGroup');
  const backgroundName = document.getElementById('backgroundName');
  const togglePassedDaysButton = document.getElementById('togglePassedDays');
  const calendarToggle = document.getElementById('calendarToggle');
  const calendarContainer = document.getElementById('calendarContainer');
  const upArrow = document.getElementById('jumpArrow');
  let showPassedDays = false;

  // Function to update the logo based on the mode
  function updateLogo() {
    if (document.body.classList.contains('dark-mode')) {
      logoImage.src = 'images/Badger-logo-dark.png';
    } else {
      logoImage.src = 'images/Badger-logo.png';
    }
  }

  // Check for saved dark mode preference
  if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    updateLogo();
  }

  const clipboardIcon = document.getElementById('clipboardIcon');
  if (clipboardIcon) {
    clipboardIcon.addEventListener('click', function () {
      document.getElementById('bulletinContent').innerHTML = localStorage.getItem('bulletinContent');
      showPopup(); // Show the bulletin popup
    });
  }

  // Check for saved login
  const savedUsername = localStorage.getItem('username');
  const savedUserType = localStorage.getItem('userType');
  const savedUserDisplayName = localStorage.getItem('userDisplayName');

  if (savedUsername) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('signOutButton').style.display = 'block';
    document.getElementById('jumpArrow').style.display = 'block';
    document.getElementById('openbtn').style.display = 'block';

    fetchLocalJson(); // Fetch local JSON automatically

    if (savedUserType === 'admin') {
      document.getElementById('searchSection').style.display = 'block';
    } else {
      const formattedName = savedUserDisplayName.charAt(0).toUpperCase() + savedUserDisplayName.slice(1).toLowerCase();
      document.getElementById('searchSection').style.display = 'block';
      document.getElementById('searchTitle').style.display = 'none';
      document.getElementById('searchButton').style.display = 'none';
      searchInputGroup.style.display = 'none';
      const employeeNameHeader = document.getElementById('employeeNameHeader');
      employeeNameHeader.textContent = `Welcome, ${formattedName}`;
      performSearch(savedUserDisplayName); // Perform search for the logged-in user
    }
  } else {
    document.getElementById('signOutButton').style.display = 'none';
    document.getElementById('jumpArrow').style.display = 'none';
    document.getElementById('openbtn').style.display = 'none';
  }

  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const username = document.getElementById('username').value.toLowerCase();
      const password = document.getElementById('password').value;

      // Load user data from external file
      fetch('json/formatted_users.json')
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((users) => {
          console.log(users); // Log users data for debugging
          const user = users.find((user) => user.username === username);

          if (!user) {
            document.getElementById('loginError').textContent = 'Invalid username';
          } else if (user.password !== password) {
            document.getElementById('loginError').textContent = 'Invalid password';
          } else {
            localStorage.setItem('username', username);
            localStorage.setItem('userType', user.type);
            // localStorage.setItem('userDisplayName', user.displayName || username); CHANGE THIS
            localStorage.setItem('userDisplayName', user.firstName || username);
            localStorage.setItem('userOffice', user.office);
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('signOutButton').style.display = 'block';
            document.getElementById('jumpArrow').style.display = 'block';
            document.getElementById('openbtn').style.display = 'block';

            fetchLocalJson(); // Fetch local JSON automatically

            if (user.type === 'admin') {
              document.getElementById('searchSection').style.display = 'block';
            } else {
              document.getElementById('searchSection').style.display = 'block';
              searchInputGroup.style.display = 'none';
              const employeeNameHeader = document.getElementById('employeeNameHeader');
              employeeNameHeader.textContent = `Results for: ${user.displayName.toUpperCase()}`;
              performSearch(user.displayName); // Perform search for the logged-in user
            }

            location.reload(); // Refresh the screen after login
          }
        })
        .catch((error) => {
          console.error('Error fetching users data:', error);
          document.getElementById('loginError').textContent = 'Error fetching users data';
        });
    });
  }

  // Handle sign out
  if (signOutButton) {
    signOutButton.addEventListener('click', function () {
      localStorage.removeItem('username');
      localStorage.removeItem('userType');
      localStorage.removeItem('userDisplayName');
      localStorage.removeItem('userOffice');
      document.getElementById('loginSection').style.display = 'block';
      document.getElementById('searchSection').style.display = 'none';
      document.getElementById('signOutButton').style.display = 'none';
      document.getElementById('jumpArrow').style.display = 'none';
      document.getElementById('openbtn').style.display = 'none';
      document.getElementById('username').value = '';
      document.getElementById('password').value = '';
      backgroundName.style.display = 'none';
      calendarContainer.style.display = 'none';
      calendarToggle.textContent = 'View Calendar';

      // Clear login error message
      document.getElementById('loginError').textContent = '';
    });
  }

  // Handle dark mode toggle
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', function () {
      document.body.classList.toggle('dark-mode');
      if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
      } else {
        localStorage.setItem('darkMode', 'disabled');
      }
      updateLogo();
    });
  }

  function fetchAndSaveBulletinContent() {
    // Check if the user is logged in
    const savedUsername = localStorage.getItem('username');
    if (!savedUsername) {
      return; // Do not show the bulletin if the user is not logged in
    }

    fetch('Bulletin Board.docx')
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => {
        mammoth
          .convertToHtml({ arrayBuffer: arrayBuffer })
          .then((result) => {
            const bulletinContent = result.value.trim(); // Trim the content to remove any extra spaces
            const savedBulletinContent = localStorage.getItem('bulletinContent');
            const bulletinViewed = localStorage.getItem('bulletinViewed') === 'true';

            // Only show popup if bulletin content has changed, it has not been viewed before, and the content is not empty
            if (bulletinContent && (bulletinContent !== savedBulletinContent || !bulletinViewed)) {
              document.getElementById('bulletinContent').innerHTML = bulletinContent;
              showPopup();

              // Save the new bulletin content and mark it as viewed
              localStorage.setItem('bulletinContent', bulletinContent);
              localStorage.setItem('bulletinViewed', 'true');
            } else if (!bulletinContent) {
              localStorage.setItem('bulletinContent', '');
            }
          })
          .catch((error) => console.error('Error parsing Word document:', error));
      })
      .catch((error) => console.error('Error fetching bulletin content:', error));
  }

  // Show popup
  function showPopup() {
    document.getElementById('popup').classList.remove('hidden');
    document.body.classList.add('body-no-scroll');
  }

  // Hide popup
  function hidePopup() {
    document.getElementById('popup').classList.add('hidden');
    document.body.classList.remove('body-no-scroll');
    // Mark bulletin as viewed when the popup is closed
    localStorage.setItem('bulletinViewed', 'true');
  }

  document.getElementById('closePopup').addEventListener('click', hidePopup);

  // Show popup on page load if conditions are met
  fetchAndSaveBulletinContent();

  window.addEventListener('click', function (event) {
    if (event.target === document.getElementById('popup')) {
      hidePopup();
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    const popup = document.getElementById('popup');
    const closePopup = document.getElementById('closePopup');

    closePopup.addEventListener('click', hidePopup);

    // Show popup on page load if conditions are met
    fetchAndSaveBulletinContent();

    window.addEventListener('click', function (event) {
      if (event.target === popup) {
        hidePopup();
      }
    });
  });

  // Fetch local JSON
  function fetchLocalJson() {
    fetch('json/store_runs.json')
      .then((response) => response.json())
      .then((json) => {
        localStorage.setItem('jsonData', JSON.stringify(json));
      })
      .catch((error) => {
        console.error('Error fetching local JSON:', error);
        document.getElementById('jsonOutput').textContent = 'Error fetching local JSON file.';
      });
  }

  // Handle search form submission
  if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const employeeName = document.getElementById('employeeName').value.trim().toLowerCase();
      if (employeeName === 'all stores') {
        displayAllStores(); // Call the function to display all stores
        calendarContainer.style.display = 'none';
        calendarToggle.textContent = 'View Calendar';
      } else if (employeeName) {
        performSearch(employeeName);
        document.getElementById('employeeNameHeader').textContent = `${employeeName.toUpperCase()}`;
        calendarContainer.style.display = 'none';
        calendarToggle.textContent = 'View Calendar';
      }
    });
  }

  function performSearch(employeeName) {
    let jsonData = localStorage.getItem('jsonData');
    if (!jsonData) {
      fetchLocalJson(); // Fetch the JSON data again if it's null
      jsonData = localStorage.getItem('jsonData');
    }

    if (jsonData) {
      const results = searchEmployeeRuns(JSON.parse(jsonData), employeeName);
      const suggestionsContainer = document.getElementById('suggestions');

      // Extract office information and update local storage
      const office = extractOfficeInfo(results, employeeName);
      if (office) {
        localStorage.setItem('userOffice', office);
      }

      displaySearchResults(results, employeeName, office);

      document.getElementById('employeeName').value = ''; // Clear the textbox
      suggestionsContainer.innerHTML = '';
    } else {
      document.getElementById('resultsContainer').textContent = 'No data available for search.';
    }
  }

  function extractOfficeInfo(results, employeeName) {
    for (let run of results) {
      for (let employee in run.employee_list) {
        if (employee.toLowerCase() === employeeName.toLowerCase()) {
          return run.employee_list[employee][2]; // Assuming the office information is at index 2
        }
      }
    }
    return null;
  }

  // Search for employee runs
  function searchEmployeeRuns(json, employeeName) {
    const regex = new RegExp(`\\b${employeeName}\\b`);
    return json.filter((run) => {
      return Object.keys(run.employee_list).some((employee) => employee.toLowerCase() === employeeName.toLowerCase());
    });
  }

  function displayAllStores() {
    let jsonData = localStorage.getItem('jsonData');
    if (!jsonData) {
      fetchLocalJson(); // Fetch the JSON data again if it's null
      jsonData = localStorage.getItem('jsonData');
    }

    if (jsonData) {
      const results = JSON.parse(jsonData);
      displaySearchResults(results, 'all stores', null, true); // Pass true to indicate all stores search
    } else {
      document.getElementById('resultsContainer').textContent = 'No data available for search.';
    }
  }

  togglePassedDaysButton.addEventListener('click', function () {
    showPassedDays = !showPassedDays;
    togglePassedDaysButton.textContent = showPassedDays ? 'Hide Passed Days' : 'Show Passed Days';
    togglePassedDaysVisibility(showPassedDays);
  });

  function togglePassedDaysVisibility(show) {
    const passedDays = document.querySelectorAll('.passed-day');
    passedDays.forEach((day) => {
      day.style.display = show ? 'block' : 'none';
    });
  }

  function displaySearchResults(results, employeeName, office, isAllStoresSearch = false) {
    let supervisorDates = [];
    let rxDates = [];
    let driverDates = [];

    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '';

    const jsonData = JSON.parse(localStorage.getItem('jsonData'));

    const allDates = new Set(jsonData.map((run) => run.date));

    const groupedByDate = results.reduce((acc, run) => {
      (acc[run.date] = acc[run.date] || []).push(run);
      return acc;
    }, {});

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const searchNameOffice = localStorage.getItem('userOffice');

    allDates.forEach((date) => {
      const runDate = new Date(date + ' ' + new Date().getFullYear());
      runDate.setHours(0, 0, 0, 0);

      const dateCard = document.createElement('div');
      dateCard.classList.add('card');

      const dateHeader = document.createElement('h3');
      dateHeader.textContent = date;
      dateCard.appendChild(dateHeader);

      const runsForDate = groupedByDate[date] || [];

      const formattedDate = `${runDate.getMonth() + 1}/${runDate.getDate()}`;

      runsForDate.forEach((run) => {
        Object.keys(run.employee_list).forEach((employee) => {
          const [number, note] = run.employee_list[employee];
          if (employee.toLowerCase() === employeeName.toLowerCase() && number === '1)') {
            supervisorDates.push(formattedDate);
          } else if (employee.toLowerCase() === employeeName.toLowerCase() && note.toLowerCase().includes('supv rx')) {
            rxDates.push(formattedDate);
          }
          if (employee.toLowerCase() === employeeName.toLowerCase() && note.toLowerCase().includes('driver')) {
            driverDates.push(formattedDate);
          }
        });
      });

      localStorage.setItem('supervisorDates', JSON.stringify(supervisorDates));
      localStorage.setItem('rxDates', JSON.stringify(rxDates));
      localStorage.setItem('driverDates', JSON.stringify(driverDates));

      runsForDate.sort((a, b) => {
        const aContainsAfter = Object.keys(a.employee_list).some((employee) => a.employee_list[employee][1].toLowerCase().includes('after'));
        const bContainsAfter = Object.keys(b.employee_list).some((employee) => b.employee_list[employee][1].toLowerCase().includes('after'));
        if (aContainsAfter && !bContainsAfter) return 1;
        if (!aContainsAfter && bContainsAfter) return -1;
        return 0;
      });

      let foundEmployee = false;
      runsForDate.forEach((run, index) => {
        const runElement = document.createElement('div');
        runElement.classList.add('run-details');

        if (index < 1) {
          // Optional: Add class for alternating background colors
        } else {
          runElement.classList.add('odd');
        }

        if (index === 0) {
          if (Array.isArray(run.meet_time)) {
            const filteredMeetTimes = filterMeetTimes(run.meet_time, searchNameOffice);
            if (filteredMeetTimes.length > 0) {
              const meetTime = document.createElement('p');
              meetTime.classList.add('meetTime');
              const meetLinks = document.createElement('a');
              meetLinks.href = 'https://sites.google.com/view/badgeremployeeterminal/meetscontact-list?authuser=0';
              meetLinks.innerHTML = `<small style="text-align: right">Can't find meet?</small>`;
              meetTime.innerHTML = `<strong>Meet Time:</strong> ${filteredMeetTimes.join(', ')}`;
              runElement.appendChild(meetTime);
              runElement.appendChild(meetLinks);
            }
          } else if (run.meet_time) {
            const meetTime = document.createElement('p');
            meetTime.innerHTML = `<strong>Meet Time:</strong> ${run.meet_time}`;
            runElement.appendChild(meetTime);
          }
        }

        if (run.start_time) {
          const startTime = document.createElement('p');
          startTime.innerHTML = `<strong>Start Time:</strong> ${run.start_time}`;
          runElement.appendChild(startTime);
        }

        let supervisor = '';
        let drivers = [];
        let searchNameNote = '';
        Object.keys(run.employee_list).forEach((employee) => {
          const [number, note, office] = run.employee_list[employee];
          if (employee.toLowerCase() === employeeName.toLowerCase()) {
            searchNameNote = note;
            foundEmployee = true;
          }
          if (number === '1)') {
            supervisor = employee;

            if (employeeName.toLowerCase() == employee.toLowerCase()) {
              const crownImage = document.createElement('img');
              crownImage.src = 'images/crown.png';
              crownImage.classList.add('crown-logo');
              dateCard.appendChild(crownImage);
            }
          }

          if (employeeName.toLowerCase() == employee.toLowerCase() && note.toLowerCase().includes('supv rx')) {
            const rxImage = document.createElement('img');
            rxImage.src = 'images/rx.png';
            rxImage.classList.add('rx-logo');
            dateCard.appendChild(rxImage);
          }

          // if (note.toLowerCase().includes('driver') && searchNameOffice === office) { CHANGE THIS
          if (note.toLowerCase().includes('driver')) {
            if (employee.toLowerCase() !== employeeName.toLowerCase()) {
              const noteParts = note.split(',');
              if (note.includes(',')) {
                const vehicle = noteParts[1].trim();
                drivers.push(`${employee} <span style="color: green;">(${vehicle})</span>`);
              } else {
                drivers.push(`${employee}`);
              }
            } else {
              const carLogoLight = document.createElement('img');
              carLogoLight.src = 'images/car_logo_light.png';
              carLogoLight.classList.add('car-logo', 'car-logo-light');
              dateCard.appendChild(carLogoLight);

              const carLogoDark = document.createElement('img');
              carLogoDark.src = 'images/car_logo_dark.png';
              carLogoDark.classList.add('car-logo', 'car-logo-dark');
              dateCard.appendChild(carLogoDark);
            }
          }
        });

        if (supervisor && supervisor.toLowerCase() !== employeeName.toLowerCase()) {
          const supervisorElement = document.createElement('p');
          supervisorElement.innerHTML = `<strong>Supervisor:</strong> ${supervisor}`;
          runElement.appendChild(supervisorElement);
        }

        if (index === 0 && run.meet_time.length > 0 && drivers.length > 0 && !isAllStoresSearch) {
          const driversElement = document.createElement('p');
          driversElement.innerHTML = `<strong>Drivers:</strong> ${drivers.join(' | ')}`;
          runElement.appendChild(driversElement);
        }

        let otherEmployeesWithRx = [];
        Object.keys(run.employee_list).forEach((employee) => {
          const [number, note, office] = run.employee_list[employee];
          if (note.toLowerCase().includes('rx') && employee.toLowerCase() !== employeeName.toLowerCase()) {
            otherEmployeesWithRx.push(`${employee}`);
          }
        });

        if (otherEmployeesWithRx.length > 0 && searchNameNote.toLowerCase().includes('rx')) {
          const otherEmployeesElement = document.createElement('p');
          otherEmployeesElement.innerHTML = `<strong>RX:</strong> ${otherEmployeesWithRx.join(' | ')}`;
          runElement.appendChild(otherEmployeesElement);
        } else if (otherEmployeesWithRx.length > 0 && employeeName.toLowerCase() == supervisor.toLowerCase()) {
          const otherEmployeesElement = document.createElement('p');
          otherEmployeesElement.innerHTML = `<strong>RX:</strong> ${otherEmployeesWithRx.join(' | ')}`;
          runElement.appendChild(otherEmployeesElement);
        }

        if (searchNameNote) {
          const searchNameNoteElement = document.createElement('p');
          searchNameNoteElement.id = 'searchNameNote';
          searchNameNoteElement.innerHTML = `${searchNameNote}`;
          runElement.appendChild(searchNameNoteElement);
        }

        const storeCardContainer = document.createElement('div');
        storeCardContainer.classList.add('store-card-container');
        if (run.store_name.length > 1 && !isAllStoresSearch) {
          storeCardContainer.classList.add('hidden');
        }

        run.store_name.forEach((store, index) => {
          const storeCard = document.createElement('div');
          storeCard.classList.add('store-card');

          const storeName = document.createElement('p');
          storeName.innerHTML = `<strong>${store}</strong>`;
          storeCard.appendChild(storeName);

          if (run.store_note[index] !== undefined) {
            const storeNote = document.createElement('p');
            storeNote.innerHTML = `${run.store_note[index]}`;
            storeNote.style.color = 'red';
            storeCard.appendChild(storeNote);
          }

          if (run.inv_type[index] !== undefined) {
            const invType = document.createElement('p');
            invType.innerHTML = `${run.inv_type[index]}`;
            storeCard.appendChild(invType);
          }

          const link = document.createElement('a');
          link.href = run.link[index];
          link.textContent = run.address[index];
          storeCard.appendChild(link);

          storeCardContainer.appendChild(storeCard);
        });

        if (run.store_name.length > 1 && !isAllStoresSearch) {
          const toggleStoreButton = document.createElement('button');
          toggleStoreButton.textContent = 'Toggle Stores';
          toggleStoreButton.classList.add('show-all');
          toggleStoreButton.addEventListener('click', () => {
            storeCardContainer.classList.toggle('hidden');
          });
          runElement.appendChild(toggleStoreButton);
        }

        runElement.appendChild(storeCardContainer);

        const employeeList = document.createElement('ul');
        employeeList.classList.add('employee-list', 'hidden');
        const isSpecialEmployee = Object.keys(run.employee_list).some((employee) => {
          if (employee.toLowerCase() === employeeName.toLowerCase()) {
            const [number, note, office] = run.employee_list[employee];
            const searchNameOffice = localStorage.getItem('userOffice');
            // return number === '1)' || (note.toLowerCase().includes('driver') && searchNameOffice === office && !note.toLowerCase().includes('@ store')); CHANGE THIS
            return number === '1)' || (note.toLowerCase().includes('driver') && !note.toLowerCase().includes('@ store'));
          }
          return false;
        });

        if (isSpecialEmployee) {
          Object.keys(run.employee_list).forEach((employee) => {
            const [number, note, office] = run.employee_list[employee];
            const searchNameOffice = localStorage.getItem('userOffice');
            // if (
            //   employee.toLowerCase() !== employeeName.toLowerCase() &&
            //   searchNameOffice === office &&
            //   number !== '#' &&
            //   !note.toLowerCase().includes('@ store')
            // ) { CHANGE THIS
            if (
              employee.toLowerCase() !== employeeName.toLowerCase() &&
              !note.toLowerCase().includes('@ store') &&
              number !== '#' &&
              !note.toLowerCase().includes('driver')
            ) {
              const listItem = document.createElement('li');
              listItem.innerHTML = `<strong>${employee}</strong>`;
              employeeList.appendChild(listItem);
            }
          });
        }

        let isSupervisor = false;
        Object.keys(run.employee_list).forEach((employee) => {
          const [number] = run.employee_list[employee];
          if (employee.toLowerCase() === employeeName.toLowerCase() && number === '1)') {
            isSupervisor = true;
          }
        });

        if (isSupervisor) {
          employeeList.innerHTML = '';
          Object.keys(run.employee_list).forEach((employee) => {
            const [number, note] = run.employee_list[employee];
            if (employee.toLowerCase() !== employeeName.toLowerCase() && number !== '#') {
              const listItem = document.createElement('li');
              if (note !== '') {
                listItem.innerHTML = `<strong>${employee}</strong> - <small style="color: green;">${note}</small>`;
              } else {
                listItem.innerHTML = `<strong>${employee}</strong>`;
              }
              employeeList.appendChild(listItem);
            }
          });
        }

        if (employeeList.childElementCount > 0) {
          const toggleEmployeeButton = document.createElement('button');
          toggleEmployeeButton.textContent = 'Toggle Employees';
          toggleEmployeeButton.addEventListener('click', () => {
            employeeList.classList.toggle('hidden');
          });
          runElement.appendChild(toggleEmployeeButton);
        }

        runElement.appendChild(employeeList);
        dateCard.appendChild(runElement);

        const separator = document.createElement('hr');
        dateCard.appendChild(separator);
      });

      if (runDate < currentDate) {
        localStorage.setItem('rundate', runDate);
        localStorage.setItem('currentdate', currentDate);
        dateCard.classList.add('passed-day');
        dateCard.style.display = 'none';
      }

      if (runsForDate.length === 0 || !foundEmployee) {
        const noRunsMessage = document.createElement('p');
        dateCard.appendChild(noRunsMessage);
      }

      resultsContainer.appendChild(dateCard);
    });

    const dateCards = Array.from(resultsContainer.getElementsByClassName('card'));
    dateCards.sort((a, b) => new Date(a.querySelector('h3').textContent) - new Date(b.querySelector('h3').textContent));

    resultsContainer.innerHTML = '';
    dateCards.forEach((card) => resultsContainer.appendChild(card));

    document.querySelectorAll('.employee-list li').forEach((li) => {
      li.addEventListener('click', function () {
        li.classList.toggle('strikethrough');
      });
    });
  }

  function filterMeetTimes(meetTimes, office) {
    return meetTimes
      .filter((time) => {
        if (time.includes('M:') && office === 'Milwaukee') return true;
        if (time.includes('IL:') && office === 'Rockford') return true;
        if (time.includes('FV:') && office === 'Fox Valley') return true;
        if (time.includes('MD:') && office === 'Madison') return true;
        if (!time.includes('M:') && !time.includes('IL:') && !time.includes('FV:') && !time.includes('MD:')) return true;
        return false;
      })
      .map((time) => {
        return time.replace('M:', '').replace('IL:', '').replace('FV:', '').replace('MD:', '').trim();
      });
  }

  const searchInput = document.getElementById('employeeName');
  const suggestionsContainer = document.getElementById('suggestions');

  searchInput.addEventListener('input', function () {
    const query = searchInput.value.toLowerCase();
    if (query.length > 0) {
      showSuggestions(query);
    } else {
      suggestionsContainer.innerHTML = '';
    }
  });

  function showSuggestions(query) {
    let jsonData = localStorage.getItem('jsonData');
    if (!jsonData) {
      fetchLocalJson();
      jsonData = localStorage.getItem('jsonData');
    }

    if (jsonData) {
      const data = JSON.parse(jsonData);
      const employeeNames = new Set();
      data.forEach((run) => {
        Object.keys(run.employee_list).forEach((name) => {
          if (name.toLowerCase().includes(query)) {
            employeeNames.add(name);
          }
        });
      });

      displaySuggestions(Array.from(employeeNames));
    }
  }

  function displaySuggestions(names) {
    suggestionsContainer.innerHTML = '';
    names.forEach((name, index) => {
      const suggestion = document.createElement('div');
      suggestion.classList.add('suggestion');
      suggestion.textContent = name;
      suggestion.addEventListener('click', () => {
        searchInput.value = name;
        suggestionsContainer.innerHTML = '';
      });
      suggestionsContainer.appendChild(suggestion);

      if (index < names.length - 1) {
        const separator = document.createElement('hr');
        separator.classList.add('suggestion-separator');
        suggestionsContainer.appendChild(separator);
      }
    });
  }

  // Toggle calendar visibility
  calendarToggle.addEventListener('click', function () {
    if (calendarContainer.style.display === 'none') {
      calendarContainer.style.display = 'block';
      generateCalendar();
      calendarToggle.textContent = 'Hide Calendar';
    } else {
      calendarContainer.style.display = 'none';
      calendarToggle.textContent = 'View Calendar';
    }
  });

  // Helper function to parse date from card title
  function parseDateFromTitle(title) {
    const date = new Date(title + ' ' + new Date().getFullYear());
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }

  // Function to get the month name
  function getMonthName(monthIndex) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[monthIndex];
  }

  function isPayday(day, month, year) {
    const startDate = new Date(2024, 6, 5); // July 5, 2024
    const currentDate = new Date(year, month, day);
    const diffTime = Math.abs(currentDate - startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays % 14 === 0;
  }

  function extractDatesFromBulletin() {
    const bulletinContent = localStorage.getItem('bulletinContent');
    const datePattern = /([A-Z][a-z]{2})? ?(\d{1,2})(?:th|st|nd|rd)?/g;
    const datesWithSuffixes = bulletinContent.match(datePattern);

    if (!datesWithSuffixes) return [];

    let lastMonth = null;

    // Remove the suffixes and assume the month for dates
    return datesWithSuffixes.map((date) => {
      const monthDayMatch = date.match(/([A-Z][a-z]{2})? ?(\d{1,2})(?:th|st|nd|rd)?/);
      let month = monthDayMatch[1];
      const day = monthDayMatch[2];

      if (month) {
        lastMonth = month;
      } else {
        month = lastMonth;
      }

      return `${month} ${day}`;
    });
  }

  function generateCalendar() {
    fetchAndSaveBulletinContent();
    const cardElements = document.querySelectorAll('.card');
    const dateStatuses = {};
    const bulletinDates = extractDatesFromBulletin();
    localStorage.setItem('WeekendDays', bulletinDates);
    const currentYear = new Date().getFullYear();
    const supervisorDates = JSON.parse(localStorage.getItem('supervisorDates')) || [];
    const rxDates = JSON.parse(localStorage.getItem('rxDates')) || [];
    const driverDates = JSON.parse(localStorage.getItem('driverDates')) || [];

    cardElements.forEach((card) => {
      const dateTitle = card.querySelector('h3').textContent;
      const dateKey = parseDateFromTitle(dateTitle);
      const hasStoreCard = card.querySelector('.store-card') !== null;

      if (!dateStatuses[dateKey]) {
        dateStatuses[dateKey] = { hasStoreCard: false };
      }

      if (hasStoreCard) {
        dateStatuses[dateKey].hasStoreCard = true;
      }
    });

    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const monthName = getMonthName(month);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    calendar.innerHTML = '';

    const monthNameElement = document.createElement('div');
    monthNameElement.id = 'monthName';
    monthNameElement.textContent = monthName;
    calendar.appendChild(monthNameElement);

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekdaysRow = document.createElement('div');
    weekdaysRow.classList.add('weekdays');
    weekdays.forEach((day) => {
      const weekday = document.createElement('div');
      weekday.classList.add('weekday');
      weekday.textContent = day;
      weekdaysRow.appendChild(weekday);
    });
    calendar.appendChild(weekdaysRow);

    const previousMonthDays = new Date(year, month, 0).getDate();
    const previousMonthStartDay = previousMonthDays - firstDay + 1;

    for (let i = previousMonthStartDay; i <= previousMonthDays; i++) {
      const date = `${month}/${i}`;
      const calendarDay = document.createElement('div');
      calendarDay.classList.add('calendar-day', 'gray');
      calendarDay.textContent = i;

      if (dateStatuses[date]) {
        calendarDay.classList.remove('gray');
        if (dateStatuses[date].hasStoreCard) {
          calendarDay.classList.add('red');
        } else {
          calendarDay.classList.add('green');
        }
      }

      calendar.appendChild(calendarDay);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${month + 1}/${day}`;
      const calendarDay = document.createElement('div');
      calendarDay.classList.add('calendar-day');
      calendarDay.textContent = day;

      if (day === currentDay) {
        calendarDay.classList.add('current-day');
      }

      if (isPayday(day, month, year)) {
        // calendarDay.classList.add('payday');
        const cashImage = document.createElement('img');
        cashImage.src = 'images/cash.png';
        cashImage.classList.add('cash-logo');
        calendarDay.appendChild(cashImage);
      }

      if (dateStatuses[date]) {
        calendarDay.classList.remove('gray');
        if (dateStatuses[date].hasStoreCard) {
          calendarDay.classList.add('red');
        } else {
          calendarDay.classList.add('green');
        }
      } else {
        calendarDay.classList.add('gray');
      }

      if (bulletinDates.includes(`${getMonthName(month).substring(0, 3)} ${day}`)) {
        calendarDay.classList.add('weekendDay');
      }

      if (supervisorDates.includes(date)) {
        const crownImage = document.createElement('img');
        crownImage.src = 'images/crown.png';
        crownImage.classList.add('crown-logo');
        calendarDay.appendChild(crownImage);
      }

      if (rxDates.includes(date)) {
        const rxImage = document.createElement('img');
        rxImage.src = 'images/rx.png';
        rxImage.classList.add('rx-logo');
        calendarDay.appendChild(rxImage);
      }

      if (driverDates.includes(date)) {
        const driverImage = document.createElement('img');
        driverImage.src = 'images/calendar-car.png';
        driverImage.classList.add('calendar-car-logo');
        calendarDay.appendChild(driverImage);
      }

      calendarDay.addEventListener('click', function () {
        scrollToDayCard(date);
      });

      calendar.appendChild(calendarDay);
    }

    const totalCells = calendar.querySelectorAll('.calendar-day').length;
    const nextMonthDays = 6 * 7 - totalCells;

    for (let day = 1; day <= nextMonthDays; day++) {
      const date = `${month + 2}/${day}`;
      const calendarDay = document.createElement('div');
      calendarDay.classList.add('calendar-day', 'gray');
      calendarDay.textContent = day;

      if (isPayday(day, month + 1, year)) {
        // calendarDay.classList.add('payday');
        const cashImage = document.createElement('img');
        cashImage.src = 'images/cash.png';
        cashImage.classList.add('cash-logo');
        calendarDay.appendChild(cashImage);
      }

      if (isBulletinDay(day, month + 1)) {
        calendarDay.classList.add('weekendDay');
      }

      if (dateStatuses[date]) {
        calendarDay.classList.remove('gray');
        if (dateStatuses[date].hasStoreCard) {
          calendarDay.classList.add('red');
        } else {
          calendarDay.classList.add('green');
        }
      }

      if (supervisorDates.includes(date)) {
        const crownImage = document.createElement('img');
        crownImage.src = 'images/crown.png';
        crownImage.classList.add('crown-logo');
        calendarDay.appendChild(crownImage);
      }

      if (rxDates.includes(date)) {
        const rxImage = document.createElement('img');
        rxImage.src = 'images/rx.png';
        rxImage.classList.add('rx-logo');
        calendarDay.appendChild(rxImage);
      }

      if (driverDates.includes(date)) {
        const driverImage = document.createElement('img');
        driverImage.src = 'images/calendar-car.png';
        driverImage.classList.add('calendar-car-logo');
        calendarDay.appendChild(driverImage);
      }

      calendarDay.addEventListener('click', function () {
        scrollToDayCard(date);
      });

      calendar.appendChild(calendarDay);
    }
  }

  function isPayday(day, month, year) {
    const startDate = new Date(2024, 6, 5); // July 5, 2024
    const currentDate = new Date(year, month, day);
    const diffTime = Math.abs(currentDate - startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays % 14 === 0;
  }

  function isBulletinDay(day, month) {
    const bulletinDates = extractDatesFromBulletin();
    const monthName = getMonthName(month).substring(0, 3);
    const formattedDate = `${monthName} ${day}`;

    return bulletinDates.includes(formattedDate);
  }

  function scrollToDayCard(date) {
    const cardElements = document.querySelectorAll('.card');
    cardElements.forEach((card) => {
      const dateTitle = card.querySelector('h3').textContent;
      const dateKey = parseDateFromTitle(dateTitle);
      if (dateKey === date) {
        card.scrollIntoView({ behavior: 'auto' });
      }
    });
  }

  // Fetch local JSON
  function fetchLocalJson() {
    fetch('json/store_runs.json')
      .then((response) => response.json())
      .then((json) => {
        localStorage.setItem('jsonData', JSON.stringify(json));
      })
      .catch((error) => {
        console.error('Error fetching local JSON:', error);
      });
  }

  // Initial data fetch
  fetchLocalJson();

  const sidepanel = document.getElementById('sidepanel');
  const main = document.getElementById('main');
  const closebtn = document.getElementById('closebtn');
  const openbtn = document.getElementById('openbtn');

  // Ensure side panel is closed on page load
  closeSidePanel();

  // Check if the side panel state is saved in localStorage
  if (localStorage.getItem('sidePanelOpen') === 'true') {
    openSidePanel();
  } else {
    closeSidePanel();
  }

  // Handle opening the side panel
  openbtn.addEventListener('click', function () {
    openSidePanel();
  });

  // Handle closing the side panel
  closebtn.addEventListener('click', function () {
    closeSidePanel();
  });

  // Function to open the sidepanel with a delay
  function openSidePanel() {
    sidepanel.style.width = '0';
    sidepanel.classList.remove('hidden');
    setTimeout(() => {
      sidepanel.style.width = '250px'; // Adjust this value to your desired width
    }, 200); // Delay of 300ms
  }

  // Function to close the side panel
  function closeSidePanel() {
    sidepanel.style.width = '0';
    main.style.marginLeft = '0';
    localStorage.setItem('sidePanelOpen', 'false');
  }

  // Close the side panel if the user clicks or taps outside of it
  function outsideClickListener(event) {
    if (event.target !== sidepanel && !sidepanel.contains(event.target) && event.target !== openbtn) {
      closeSidePanel();
    }
  }

  window.addEventListener('click', outsideClickListener);
  window.addEventListener('touchstart', outsideClickListener);

  const openbtnImg = openbtn.querySelector('img');

  openbtn.addEventListener('click', function () {
    openbtnImg.classList.add('animate');

    // Remove the animation class after the animation ends
    openbtnImg.addEventListener(
      'animationend',
      function () {
        openbtnImg.classList.remove('animate');
      },
      { once: true }
    );
  });

  if (!localStorage.getItem('hasReloaded')) {
    location.reload();
    localStorage.setItem('hasReloaded', 'true');
  } else {
    localStorage.removeItem('hasReloaded'); // Reset for future visits
  }

  // Prevent double-tap zoom
  let lastTap = 0;

  document.addEventListener('touchend', function (event) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 250 && tapLength > 0) {
      event.preventDefault();
    }
    lastTap = currentTime;
  });

  const refreshInterval = 15 * 60 * 1000; // 2 minutes in milliseconds

  setInterval(function () {
    location.reload(); // This will refresh the page
  }, refreshInterval);
});
