$('#btn-toggle-nav').on('click', function(){
    $togglebtn = $(this);
    $togglebtn.toggleClass('slim');
    $('#site_content').toggleClass('slim');
    $('#sidebar').toggleClass('slim');
    $('.nav-label').toggleClass('slim');
    $('#user-detail').toggleClass('slim');
    $.ajax({
        type:'get',
        url: 'set_slim.php',
        success: function (result) {
            
        }
    });
});

// Mobile Navbar
$('#toggle-btn').on('click', function () {
    $('#sidebar').toggleClass('open');
});

// Styling SideNav at Mobile
$window_width = $(window).width();
$topnav_height = $('#top_nav').height();
if(parseInt($window_width) <= 767){
    $('#user-detail').css('margin-top', ($topnav_height + 10));
}else{
    $('#user-detail').css('margin-top', 'auto');
}
// console.log($topnav_height);

$(document).ready(function () {
    $('#form_details').on('dblclick', 'label', function () {
        $(this).children('span.norm').slideUp();
        $(this).children('span.edit').slideDown();
    });

    $('#edt_sch_profile').on('click', function () {
        $(this).siblings('span.norm').slideUp();
        $(this).siblings('span.edit').slideDown();
    });

    $('span.edit').on('blur', 'input', function () {
        $this = $(this);
        $name = $(this).attr('name');
        $value = $(this).val();
        $.ajax({
            type: 'post',
            url: './ajax/update_user_info.php',
            dataType: 'json',
            data: {name: $name, value: $value, what2do:'update_biodata'},
            beforeSend:function () {
                
            },
            success: function (result) {
                if(result.status == 'success'){
                    $this.parent('span.edit').siblings('span.norm').text($value);
                    $this.parent('span.edit').slideUp();
                    $this.parent('span.edit').siblings('span.norm').slideDown();
                    proAlertInfo_tr($name + ' field was updated successfully');
                }else{
                    proAlertError_tr($name + ' field was unable to update');
                }
                console.log(result);
            },
            error: function (xhr, sta, msg) {
                console.log(msg);
            }
        });
        
    });


    $('#btn_upload_img').on('click', function () {
        $('#photo_upload').trigger('click');
    });


});

$('#photo_upload').on('change', function () {
    $file = $('#photo_upload')[0].files[0];
    if(($file.type != 'image/jpg') && ($file.type != 'image/jpeg') && ($file.type != 'image/png')){
        proAlertError_tr('Invalid Image Format');
    }else{
        var form_data = new FormData();
        form_data.append('photo', $file);
        form_data.append('imagetype', 'profile');
        $.ajax({
            type: 'post',
            url: './ajax/upload_img.php',
            data: form_data,
            processData: false,
            contentType: false,
            dataType: 'json',
            beforeSend: function () {
                $('#btn_upload_img').html('<i class="fa fa-spinner fa-pulse"></i> Uploading....');
            },
            success: function (response) {
                if(response.status == 'success'){
                    $img = $('#profile-img-container img');
                    $img.fadeOut();
                    $img.attr('src', 'imgs/profile/' + response.newimage);
                    $img.fadeIn();
                    // Side Image
                    $('.user-image-container img').attr('src',  'imgs/profile/' + response.newimage);
                }else{
                    proAlertError_tr(response.message);
                }
            },
            error: function (xhr, status, message) {
                console.log(message);
            },
            complete: function(){
                $('#btn_upload_img').html('<i class="fa fa-camera"></i> Uplaod Image');
            }
        });
    }
});

// Fetch Schools
function fetch_school_list() {
    $.ajax({
        type : 'post',
        url : './ajax/mng_school.php',
        data: {action: 'fetch'},
        dataType: 'html',
        success: function (list){
            $('#sch_list_contanier').html(list);
        },
        error: function (xhr, status, msg) {
            console.error(msg);
        }
    });
}
fetch_school_list();

$('form[name=frm_addSchool]').on('submit', function(ev){
    ev.preventDefault();
    $frmData = new FormData();
    $frmData.append('sname', $('input[name=sch_name]').val());
    $frmData.append('stype', $('#sch_type').val());
    $frmData.append('sloc', $('#loc').val());
    $frmData.append('sstate', $('#state').val());
    $frmData.append('action', 'add');
    $.ajax({
        type : 'post',
        url : './ajax/mng_school.php',
        data: $frmData,
        dataType: 'json',
        processData: false,
        contentType: false,
        beforeSend:function() {
            $('#btn_add_sch').html('<i class="fa fa-spinner fa-spin"></i> Saving Data... ');
        },
        success: function (response){
            if(response.status == 'success'){
                proAlertInfo_tr('Institution Added!');
                $('form[name=frm_addSchool]').trigger('reset');
                fetch_school_list();
            }else if(response.status == 'exist'){
                proAlertError_tr('School Already Exist!');
            }else{
                proAlertError_tr('An Error Occured');
            }
            // console.log(response);
        },
        error: function (xhr, status, msg) {
            console.error(msg);
        },
        complete: function(){
            $('#btn_add_sch').html('<i class="fa fa-save"></i> Save School Details');
        }
    })
    console.log($frmData);
});

$('#sch_list_contanier').on('click', '.del_sch_list', function () {
    $id = $(this).parent('span').parent('li').attr('id');
    $.ajax({
        type : 'post',
        url : './ajax/mng_school.php',
        data: {action: 'delete', id:$id},
        dataType: 'json',
        success: function (response){
            if(response.status == 'success'){
                proAlertInfo_tr("School deleted successfully");
                fetch_school_list();
            }else{
                proAlertError_tr('Unable to Delete School');
            }
        },
        error: function (xhr, status, msg) {
            console.error(msg);
        }
    });
});

// Change/Select Schools
$('#sel_schools').on('change', function () {
    $id = $(this).val();
    $.ajax({
        type : 'post',
        url : './ajax/update_user_info.php',
        data: {what2do: 'update_sch_id', id:$id},
        dataType: 'json',
        success: function (result){
            if(result.status == 'updated'){
                $('#sch_id').text(result.school_name);
                $('#sch_id').slideDown();
                $('#sch_id').siblings('span.edit').slideUp();
                fetch_sch_detail();
                proAlertInfo_tr('School Details Updated');
            }else{
                proAlertError_tr("An Error Occured");
            }
            // console.log(result);
        },
        error: function (xhr, status, msg) {
            console.error(msg);
        }
    });
});

// Fetch User's School Detail
function fetch_sch_detail() {
    $.ajax({
        type : 'post',
        url : './ajax/mng_school.php',
        data: {action: 'fetch_user_sch'},
        dataType: 'json',
        success: function (result){
            if(result.id > 0){
                $('#name_ins').text(result.name);
                $('#type_ins').text(result.type);
                $('#state_ins').text(result.state);
                $('#add_ins').text(result.address);
                $('#sch_det_alert').slideUp();
            }else{
                proAlertError_tr("You have not selected an Institution! Please do so.");
            }
            // console.log(result);
        },
        error: function (xhr, status, msg) {
            console.error(msg);
        }
    });
}
fetch_sch_detail();

// fetch all users
function fetch_users() {
    $.ajax({
        type : 'post',
        url : './ajax/mng_users.php',
        data: {action: 'fetch_users'},
        dataType: 'html',
        success: function (result){
            $('#userdata').html(result);
            // console.log(result);
        },
        error: function (xhr, status, msg) {
            console.error(msg);
        }
    });
}
fetch_users();

// setTimeout(() => {
//     what to do
// }, time);
// setInterval(() => {
//     what to do
// }, interval);

// search all users
function search_users(recieved_data) {
    $.ajax({
        type : 'post',
        url : './ajax/search_users.php',
        data: {user: recieved_data},
        dataType: 'html',
        success: function (result){
            $('#userdata').html(result);
            // console.log(result);
        },
        error: function (xhr, status, msg) {
            console.error(msg);
        }
    });
}

$('#srch_users').on('keyup', function () {
    $data = $(this).val();
    search_users($data);
})

function fetchStatistics(){
    $.ajax({
        type : 'post',
        url : './ajax/statistics.php',
        data: {},
        dataType: 'json',
        success: function (response){
            $('#no_schools').text(response.no_schools);
            $('#no_users').text(response.no_users);
            // console.log(response);
        },
        error: function (xhr, status, msg) {
            console.error(msg);
        }
    });
}
fetchStatistics();
setInterval(() => {
    fetchStatistics();
}, 3000);

// Switching User Account Activiness
$('#userdata').on('click', '.active-switch', function () {
    $this = $(this);
    $state = $this.prop('checked');
    $user_id = $this.parent('div').parent('td').parent('tr').attr('id');
    $.ajax({
        type : 'post',
        url : './ajax/mng_users.php',
        data: {action: 'switch_activeness', state: $state, user_id: $user_id},
        // dataType: 'html',
        beforeSend: function () {
            if($state == true){
                $this.siblings('label').text('active');
            }else{
                $this.siblings('label').text('inactive');
            }
        },
        success: function (result){
            if(result == 0){
                if($state == true){
                    $this.siblings('label').text('inactive');
                }else{
                    $this.siblings('label').text('active');
                }
            }
        },
        error: function (xhr, status, msg) {
            console.error(msg);
        }
    });
});

// View User Details
$('#userdata').on('click', '.view-user', function () {
    $this = $(this);
    $user_id = $this.parent('td').parent('tr').attr('id');
    $.ajax({
        type : 'post',
        url : './ajax/mng_users.php',
        data: {action: 'get_a_user', user_id: $user_id},
        dataType: 'json',
        beforeSend: function () {
            $('#testModal').on('show.bs.modal', function(){
                $('#testModal .modal-header').html(`
                    <i class="fa fa-circle-notch fa-spin fa-2x"></i> 
                    <strong>Loading...</strong>
                `);
            });
            $('#testModal').modal('show');
            $('#testModal').modal({
                backdrop: 'static',
                show: true
            });
        },
        success: function (result){
            $('#testModal .modal-header').html(`
                    <h4 class="modal-title">${ result.firstname }'s Details</h4>
                    <span class="close" data-dismiss="modal">
                        <i class="fa fa-times"></i>
                    </span>
                `);
            
            $('#testModal .modal-body #profile-img-container img').attr('src', 'imgs/profile/' + result.photo);
            $('#fname').text(result.firstname);
            $('#lname').text(result.lastname);
            $('#email').text(result.email);
            $('#phone').text(result.phone);

            console.log(result);
            
        },
        error: function (xhr, status, msg) {
            console.error(msg);
        }
    });
});
