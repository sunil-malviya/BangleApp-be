const custommethod = (req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'x-access-token, Origin, Content-Type, Accept');

    // Update Request Query Parameters
    let { limit, pageNo, query, orderBy, orderDirection } = req.query;
    req.query.limit = limit ? parseInt(limit) : 10;
    req.query.pageNo = pageNo ? parseInt(pageNo) : 1;
    req.query.query = query || null;
    req.query.orderBy = orderBy || 'created_at';
    req.query.orderDirection = orderDirection || 'desc';

    // Request :: Get selected body parameters as object
    req.getBody = function (array) {
        let output = {};
        let reqBody = this.body;
        Object.keys(reqBody).forEach((key) => {
            if (array.includes(key)) output[key] = reqBody[key];
        });
        return output;
    };

    // Response :: No records found
    res.noRecords = function (status = false) {
        return this.status(404).json({
            status,
            message: 'NO_RECORD_FOUND',
            data: [],
        });
    };

    // Response :: Success
    res.success = function (data = []) {
        return res.status(200).json({
            status: true,
            message: 'SUCCESS',
            data,
        });



    };

    res.infintescroll = function (data = [],page=1) {
        return res.status(200).json({
            status: true,
            message: 'SUCCESS',
            data,
            page
        });


        
    };



    // Response :: Datatables No records found
    res.datatableNoRecords = function () {
        return this.status(404).json({
            status: true,
            message: 'NO_RECORD_FOUND',
            data: {
                count: 0,
                current_page: 1,
                totalPages: 0,
                pagination: [],
                record: [],
            },
        });
    };

    res.pagination = function (results = [], total_count = 0, limit = 10, pageNo = 1) {
        const totalPages = Math.ceil(total_count / limit);
        let pagination = [pageNo];

        let i = pageNo + 1;
        while (i < pageNo + 4 && i <= totalPages) {
            pagination.push(i);
            i++;
        }

        let j = pageNo - 1;
        while (j > pageNo - 4 && j >= 1) {
            pagination.unshift(j);
            --j;
        }

        return this.success({
            count: total_count,
            current_page: pageNo,
            totalPages,
            pagination,
            record: results,
        });
    };

    // Response :: Something went wrong
    res.someThingWentWrong = function (error = { message: 'SOMETHING_WENT_WRONG' }) {
        return this.status(403).json({
            status: false,
            message: error.message || 'SOMETHING_WENT_WRONG',
            data: process.env.SHOW_ERROR ? error.stack?.split("\n")?.splice(0, 10) : [],
        });
    };

    // Response :: Success Insert
    res.successInsert = function (data = []) {
        return this.status(201).json({
            status: true,
            message: 'RECORD_INSERTED_SUCCESSFULLY',
            data,
        });
    };

    // Response :: Success Update
    res.successUpdate = function (data = []) {
        return this.status(200).json({
            status: true,
            message: 'RECORD_UPDATED_SUCCESSFULLY',
            data,
        });
    };

    // Response :: Success Delete
    res.successDelete = function (data = []) {
        return this.status(200).json({
            status: true,
            message: 'RECORD_DELETED_SUCCESSFULLY',
            data,
        });
    };

    next();
};

export default custommethod;
