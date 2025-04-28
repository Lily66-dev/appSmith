export default {
	activeProduct: {...appsmith.URL.queryParams},
	chapters:[],
	courseWare:[],
	groupIds(metadata,id,secondId) {
		const result = {};

		metadata.forEach(item => {
			const value = item[id];
			const secondValue = item[secondId];

			if (!result[value]) {
				result[value] = [];
			}
			result[value].push(secondValue);
		});

		return result;
	},
	getBaseData:async ()=>{
		const courseWare = await courseware_query.run()
		this.courseWare = courseWare

		if(appsmith.URL.queryParams?.id){
			const courseData = await course_pre_update.run({id:appsmith.URL.queryParams.id})
			const currentCourse =  courseData[0]
			this.activeProduct = currentCourse
			console.log(currentCourse,"currentCourse")

			const categoryData = await course_pre_update_category.run({id:currentCourse.id})
			const categoryIds = categoryData.map(item => item.category_id)
			this.activeProduct.categoryIds = categoryIds

			const chapterData = await course_pre_update_chaptor.run({id:currentCourse.id})
			console.log(chapterData,"chapterData")

			// 查找资料
			const chapterIds = chapterData.map(item => item.id)
			const coursewareData = await course_pre_update_courseware.run({chapter_ids:chapterIds})
			const relationCoursewareData = this.groupIds(coursewareData,"chapter_id","courseware_id")
			console.log(coursewareData,"coursewareData")

			// 查找考试
			const examData = await course_pre_update_exam.run({chapter_ids:chapterIds})
			const relationExamData = this.groupIds(examData,"chapter_id","exam_id")
			console.log(examData,"examData")

			const formatChapterData = chapterData.map(item => {
				const id =item.id
				return {
					...item,
					parentId:item.parent_id,
					attachments:relationCoursewareData[id] ?? [],
					quizzes:relationExamData[id] ?? []
				}
			})

			console.log(formatChapterData,"formatChapterData")

			this.chapters =  formatChapterData
		}
	},
	handleSearch: async () => {
		const pattern = /^\s*[\u4e00-\u9fa5a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ]+\s*$/

		if ((form_input_filename.text && !pattern.test(form_input_filename.text))) {
			return;
		}
		resetWidget("container_right_table", true).then(()=>{
			course_search.run();
			course_total.run()
		})
	},
	handleResetSearch: async () => {
		resetWidget("container_right_search", true).then(()=>{
			this.handleSearch()
		})
	},

}