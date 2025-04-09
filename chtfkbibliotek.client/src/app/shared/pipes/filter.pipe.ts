import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform(items: any[], id: number | null): any {
    if (!items || !id) return [];
    return items.filter(item => item.id === id);
  }
}
