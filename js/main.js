let map;
let lodging_places;
let bars_restaurants;
let point_of_interest_places;
let requests_in_process = [false, false, false];

let placesHandler = function (results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        let counts = [0, 0, 0];

        $.each(results, function (index, result) {
            if (result['types'].includes('lodging')) {
                lodging_places.push(result);
                results[index]['type'] = 'Accommodation';
                counts[0]++;
            } else if (result['types'].includes('restaurant') || result['types'].includes('bar')) {
                results[index]['type'] = 'Bar/Restaurant';
                bars_restaurants.push(result);
                counts[1]++;
            } else if (result['types'].includes('point_of_interest')) {
                results[index]['type'] = 'Tourist Attraction';
                point_of_interest_places.push(result);
                counts[2]++;
            }
        });

        requests_in_process[counts.indexOf(Math.max(...counts))] = false;
    }

    if (!requests_in_process[0] && !requests_in_process[1] && !requests_in_process[2]) {
        let temp_arr = lodging_places.concat(bars_restaurants, point_of_interest_places);
        temp_arr.sort(function () {
            return 0.5 - Math.random()
        });

        $('#modal-table-body').empty();

        $.each(temp_arr, function (index, place) {
            let open_now = null;
            if (place.opening_hours) {
                if (place.opening_hours.open_now) {
                    open_now = 'Yes';
                } else {
                    open_now = 'No';
                }
            } else {
                open_now = '--';
            }

            $('#modal-table-body').append(`
                <tr>
                    <td>${place.name}</td>
                    <td>${place.formatted_address}</td>
                    <td>${open_now}</td>
                    <td>${place.type}</td>
                    <td>${place.rating}</td>
                </tr>
            `);
        });

        $('#places-tbl').DataTable().destroy();
        $('#places-tbl').DataTable();
    }
};

$(document).ready(function () {
    $('#search-form').on('submit', function (e) {
        e.preventDefault();

        $('#modal-table-body').empty();
        $('#modal-table-body').append(`
            <tr>
                <td colspan="5" style="text-align: center">Loading... </td>\
            </tr>
        `);
        $('#locations-modal').modal('show');

        map = new google.maps.Map(document.getElementById('map'));

        lodging_places = [];
        bars_restaurants = [];
        point_of_interest_places = [];

        let types_of_places = ['accomodation', 'bars restaurants', 'tourist attractions'];

        $.each(types_of_places, function (index, value) {
            console.log('sending for: ' + $('#search').val() + ' ' + value);
            let request = {
                query: $('#search').val() + ' ' + value
            }

            service = new google.maps.places.PlacesService(map);
            service.textSearch(request, placesHandler);
            requests_in_process[index] = true;
        });
    });
});